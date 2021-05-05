require("./style/comme.sass");
import { cell } from "./utils/cell_factory";
import { base_cell } from "./cell/cell_render.js";//
import { renderLine } from "./lines/line_render.js";//


const component_flow = class {
  /*
  * svgPage 画布dom
  * target 渲染环境
  * ele dom
  * renderData 渲染数据
  */
  constructor(options){
    this.initData(options)
    this.svgPage =  this.initPage(); // 初始化画布；
    this.bindEvent();
  }

  /**
   * 初始化数据
   * @param {*
   *      target,      // svg || document || cavance
   *      ele,         // element
   *      flow_Data,   // 渲染数据
   *      maxScale,    // 最大缩放
   *      minSacle,    // 最小缩放
   *      spaceWidth,  // width间距
   *      spaceHeight, // height间距
   *      LineArrList, // 动画节点，需要在插入之后删除
   * } options 
   */
  initData({ 
    ele,
    flow_Data,
    ...otherOptions
  } = options){
    Object.keys(otherOptions).forEach(key=> this[key] = otherOptions[key] );

    this.renderCellTypes = [];
    this.ele = document.getElementById(ele);
    this.LineArrList = [];

    this.renderData = this.mapData((data, deep, parentTop)=> {
      const copyPropyty = {};
      for(let key in data ){
        if(cell.hasOwnProperty(key)){
          copyPropyty[key] = data[key]
        }
      };

      Object.defineProperties(data,Object.getOwnPropertyDescriptors(cell));
      Object.keys( copyPropyty ).forEach(key=> {  data[key] = copyPropyty[key]}); 

      data.id =   '__' + Math.ceil(Math.random() * 1000 *1000 * 1000);
      data.deep = deep; // 重写属性
      data.topArr = parentTop;  // 重写属性
      data.cell_sapce_width = this.spaceWidth || data.cell_sapce_width;
      data.cell_sapce_height = this.spaceHeight || data.cell_sapce_height;
      data.childrenList = [];
      if(data.children) {
        this.mapData((item)=> {
          data.childrenList.push(item);
          return item;
        }, data.children)
      }
      // this.mapData
      return data;
    }, flow_Data);
  }

  /**
   * 注册画布
   */  
  initPage(){
    const svgStr =  '<svg viewBox="0 0 500 300"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" id="component-flow-pager_content">'+

                    '</svg>';
    const html = new DOMParser().parseFromString(svgStr, "text/xml");
    const svgPage = html.getElementsByTagName('svg')[0];
    const [ width, height ] = [this.ele.offsetWidth, this.ele.offsetHeight];
    svgPage.setAttribute('width', width);
    svgPage.setAttribute('height', height);
    this.ele.appendChild(svgPage);
    return svgPage;
  }

  // 总体注册
  regietser({type,content}){
    const mapAction = {
      cell: ()=> { this.regietser_cell( content ) },
      line: ()=> { this.regietser_line( content ) }
    };
    mapAction[type]();
  }
  // 注册单元格
  regietser_cell( content ){
    if( Object.prototype.toString(content) === '[object Object]' ){
      if( !content.render_type && this.target !== 'svg' ){
        console.warn('cell 的渲染对象需要定义为 svg、document、或cavance');
      }else{
        this.renderCellTypes.push( content );
      };
    }else  if( Object.prototype.toString(content) === '[object Arrary]' ){
      this.renderCellTypes = [ ...this.renderCellTypes, ...content ];
    }else{
      console.warn('cell 类型定义不正确，你需要定义一个cell对象或者cell对象数组');
    }
  }
  regietser_line( content ){
    this.regietserRenderLine = content;
  }

  render () {
    

    // 为每个单元格——实例化
    this.renderData = this.mapData(( data )=> {
      const { render } = data;
      if(!render){
        this.initCellData(data)
      }
      return data;
    }, this.renderData);

    this.renderCell();
    this.renderLine();

  }

  observeArray(func){
    const oldArraryPropoty = Array.prototype;
    const arrayMethods = Object.create(oldArraryPropoty);
    let methods = ["push", "shift", "pop", "unshift", "reverse", "sort", "splice"];

    methods.forEach((method)=> {
      arrayMethods[method] = function(params){
        const resOld = oldArraryPropoty.prototype.apply(params);
        // func(method, );
        func(method,...params);
        return resOld;
      }
    });
    return arrayMethods;
  }

  /**
   * 初始化cellData
   * @param {*Object: cellData} data 
   */
  initCellData(data){
    // 选择渲染的单元格
    const cell_templete = this.renderCellTypes[0];
    data =  Object.assign(data, cell_templete);
    let isRender = false; // 避免触发set
    const isOpen = data.isOpen;
    const that = this;
    // 定义数据驱动模型
    Object.defineProperty( data , 'isOpen', {
      enumerable: true,
      set : function(val){
        this._open = val;
        if(isRender) that.resize();
      },
      get: function(){
        return this._open;
      }
    });

    // 监听 children 原型链事件
    data.isOpen = isOpen;
    // 设置事件
    const { svg, bindEvent } = data;
    if( bindEvent ){
      bindEvent(svg, data);
    };
    isRender = true;
  }

  /**
   * 将cell数据根据不同的 type 添加到页面当中：需要判断开启关闭状态；和是否在页面中
   * @param {*} item 
   */
  renderCell(item){
    this.mapData((item)=> {
      const { svg, left, top, isOpen } = item;
      svg.setAttribute('x', left);
      svg.setAttribute('y', top);
      this.svgPage.appendChild(svg);
      item.isInpager = true;
      return isOpen  && item ;
    }, this.renderData);
  }

  /**
   * 目前选择每次重绘线条来达到对应的效果
   */
  renderLine(){
    this.destoryLine();
    // 存储渲染的连线数据对象 
    let lineArr = [];
    // 计算每个线条数据
    this.mapData((data)=> {
      const {children , isOpen} = data;
      if( children && children.length > 0 && isOpen ){
        children.forEach(item=> {
          lineArr.push({
            start: data,
            end : item
          })
        })
      };
      return isOpen &&  data ;
    },this.renderData );

    // // 重新计算连线的起点和终点 -- 因为
    lineArr = lineArr.map( ( value )=> {
      let { start, end } = value;
      const startLeft = Number(start.svg.getAttribute('x'));
      const startTop = Number(start.svg.getAttribute('y'));
      const endLeft = Number(end.svg.getAttribute('x'));
      const endTop = Number(end.svg.getAttribute('y'));
      start = {
        startId: start.id,
        left: startLeft + start.width - start.cell_sapce_width,
        top: startTop + start.height / 2
      }
      end = {
        endId: end.id,
        left : endLeft,
        top: endTop + end.height / 2 
      }
      return { start, end };
    });

    const lineAvgArr = lineArr.map(item=> ({
      startId: item.start.startId,
      endId: item.end.endId,
      line: this.regietserRenderLine(item)
    }));

    lineAvgArr.forEach(item=> {
      const { startId, endId, line } = item;
      this.LineArrList.push(line);
      this.svgPage.appendChild(line);
    });
  }

  destoryLine(){
    while(this.LineArrList.length > 0){
      this.svgPage.removeChild(this.LineArrList.pop())
    }
  }

  resize(){
    let closeDatList = []; // 关闭列表
    this.mapData((data)=> {
      const { isOpen, svg, left, top, isInpager, id } = data;
      if( !isOpen ) closeDatList = closeDatList.concat(data.childrenList);
      const isIncloseItem = closeDatList.find(item=> item.id === id);
      if( isInpager ){ // 如果在画布中
        if(  isIncloseItem ){ // 关闭动作
          this.svgPage.removeChild(svg);
          data.isInpager = false;
        }else{
          if( svg ){
            this.animation({ svg, animation:[
              {attributeName: 'y',attributeType : 'XML' , to : top, dur: 0.5, begin: '0.1', fill:'freeze' },
              {attributeName: 'x',attributeType : 'XML' , to : left, dur: 0.5 , begin: '0.1', fill:'freeze' }
            ]});
          }
        }
      }else if(!isIncloseItem) {
        svg.setAttribute('x', left);
        svg.setAttribute('y', top);
        this.svgPage.appendChild(svg);
        data.isInpager = true;
      }

      return  data;
    },this.renderData);
  }

  appendChild(){

  }

  /**
   * 
   * @param {
   *  svg : svg 元素
   *  animate: Arrary => Obj 所有svg 可以设置的动画属性
   *  action: fade_in fade_out
   * } param0 
   */
  animation({
    svg, animation
  }){
    // 动画
    const _func = (item)=>{
      const { attributeName, attributeType ,delay ,dur, to } = item;
      let from = Number(svg.getAttribute(attributeName) || 0 );
      const stepTime = 20;
      const steps =  dur * 1000 / stepTime;
      const averageSpeed = ( to - from ) / steps;
      let speedStart = averageSpeed * 1.8;
      const speedEnd = averageSpeed * 0.2;
      const increasSPead = averageSpeed / steps ;

      let animateInterval  = setInterval(()=> {
        from += speedStart;
        this.renderLine();
        svg.setAttribute(attributeName, from );
        speedStart -= increasSPead;
        
        console.log(2 , from);
        const isOver  = speedStart > 0 ? ( from >= to ) : ( to >= from );
        if( isOver  ){
          clearInterval(animateInterval);
          animateInterval = null;
          svg.setAttribute(attributeName, to);
          this.renderLine();
        }
      }, stepTime)
    }

    for(let item of animation ){
      _func(item);
    }
  }

  clearAnimation(){
    while( this.animationNodeList.length > 0){
      const animation = this.animationNodeList.pop();
      const { svg , animationNodeChildren } = animation;
      while( animationNodeChildren.length > 0 ){
        const animate = animationNodeChildren.pop()
        try{
          svg.removeChild(animate);
        }catch(e){
          console.log(e);
        }
      }
    };
  }


  /**
   * 
   * @param {数据处理函数；你需要返回一个数据的包装对象} func 
   * @param {this.mapData} data 
   * @param  {...any:需要传入func的参数} otherParams 
   * @returns 
   */
  mapData (func, data, deep = 0, parentTop = [], ...otherParams){
    if( !data ) return;
    if( Object.prototype.toString.call(data) === '[object Object]'  ){
      const obj  = func(data, deep, parentTop,...otherParams);
      if( obj.children ){
        obj.children = this.mapData(func, obj.children,  deep + 1, parentTop, ...otherParams);
        return obj;
      }
      return data;     
    }else if( Object.prototype.toString.call(data) === '[object Array]' ){
      const arr = [];
      return data.map( (item ,index )=> {
        const res =  this.mapData(func, item,deep , parentTop.concat(arr), ...otherParams);
        arr.push(item);
        return res;
      }) 
    }
    return data;
  }

  bindEvent(){
    //鼠标滚轮事件
    const isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
    //Firefox事件：DOMMouseScroll、IE/Opera/Chrome事件：mousewheel
    const mousewheel = isFirefox ? "DOMMouseScroll" : "mousewheel";
    let isInpager = false, isMouseDown = false ;
    this.svgPage.addEventListener('mouseover',(e)=>isInpager = true);
    this.svgPage.addEventListener('mouseout',(e)=>isInpager = false);
    this.svgPage.addEventListener('mousedown',(e)=>isMouseDown = true);
    this.svgPage.addEventListener('mouseup',(e)=>isMouseDown = false);
    const scrollFunc = (e)=> {
      e = e || window.event;
      if(e.preventDefault) e.preventDefault();
      if( isInpager ){
        const { wheelDelta  } = e;
        if(wheelDelta  === 150 ){
          let [x,y,Vwidth,Vheight,rate, width,height] = this.scaleAnimaltion();
          [x,y,Vwidth,Vheight]  = [x,y,Vwidth + (Vwidth / 10 * rate) ,Vheight + Vwidth / 10];
          if( this.minSacle &&  width / Vwidth  < this.minSacle  ) Vwidth = width / this.minSacle;
          if( this.minSacle && height / Vheight  < this.minSacle  ) Vheight = height / this.minSacle;
          if( Vwidth === Infinity || Vheight === Infinity )return;
          this.svgPage.setAttribute("viewBox", [x,y,Vwidth,Vheight].join(' '))
        }else{
          let [x,y,Vwidth,Vheight,rate, width,height] = this.scaleAnimaltion();
          [x,y,Vwidth,Vheight]  = [x,y,Vwidth - (Vwidth / 10 * rate) ,Vheight - Vwidth / 10];
          if( this.maxScale &&  width / Vwidth  > this.maxScale  ) Vwidth = width / this.maxScale;
          if( this.maxScale && height / Vheight  > this.maxScale  ) Vheight = height / this.maxScale;
          if( Vwidth < 0 || Vheight < 0)return;
          this.svgPage.setAttribute("viewBox", [x,y,Vwidth,Vheight].join(' '))     
        }
      }
    }
    // 为画布添加监听滚轮事件
    this.svgPage.addEventListener(mousewheel,scrollFunc);

    const mouseMoveFunc = (e)=> {
      if( isMouseDown ) {
        let [x,y,Vwidth,Vheight,rate, width,height] = this.scaleAnimaltion();
        const { movementX,movementY} = e;
        const rateX = Vwidth / width;
        const rateY = Vheight / height;
        x -= movementX * rateX;
        y -= movementY * rateY;
        this.svgPage.setAttribute("viewBox", [x,y,Vwidth,Vheight].join(' '))     
      }
    }
    // 为画布添加拖拽事件
    this.svgPage.addEventListener('mousemove', mouseMoveFunc);
  }
  
  /**
   *  
   * return  [x,y,Vwidth,Vheight, rate, width,height]
   */
  scaleAnimaltion( ){
    let [x,y,Vwidth,Vheight] = this.svgPage.getAttribute('viewBox').split(' ').map(Number);
    const [width,height] = [this.svgPage.getAttribute('width'),this.svgPage.getAttribute('height')];
    return [x,y,Vwidth,Vheight, Math.round(width / height * 100 ) / 100, width,height];
  }
}

const flow = new component_flow({
  ele: 'app',
  flow_Data: [
    {
      label: '100',
      isOpen: true,
      // type: '',
      children: [
        {
          label: '200',
        },
        {
          label: '201',
          isOpen: false,
          children: [
            {
              label: '300',

              children: [
                {
                  label: '300'
                },
                {
                  label: '301'
                },
              ]
            },
            {
              label: '301',
            },
          ]
        },
        {
          label: '202',    
        },
      ]
    }
  ],
  spaceWidth: 0,
  spaceHeight: 10,
  maxScale: 2,
  minSacle: 0.8
});

flow.regietser({ type: 'cell', content: base_cell });
flow.regietser({ type: 'line', content: renderLine});

flow.render();

// setTimeout(()=> {
//   flow.renderData[0].isOpen = false;
// },1000)

// console.log(flow, flow.renderData, flow.renderCellTypes );
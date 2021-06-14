require("./style/comme.sass");
import { cell } from "./utils/cell_factory";
import { base_cell } from "./cell/cell_render.js";//
import { renderLine } from "./lines/line_render.js";//
import { insert_cell } from "./cell/insert_cell_render";


const component_flow = class {
  /*
  * svgPage 画布dom
  * target 渲染环境
  * ele dom
  * renderData 渲染数据
  */
  constructor(options){
    this.init(options);
    this.bindEvent();
  }

  init(options){
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
     *      mouseKey,    // 键盘按下的key
     *      LineArrList, // 动画节点，需要在插入之后删除
     * } options 
     */
    const initData = ({  ele,flow_Data,...otherOptions} = options)=>{
      Object.keys(otherOptions).forEach( key => this[key] = otherOptions[key] );
      this.renderCellTypes = []; // 存储子节点的类型
      this.ele = document.getElementById(ele);
      this.LineArrList = [];
      this.cellArrList = []; // 存储所有渲染的cell信息，通过判断 新旧 id 的不同来控制页面是否渲染和删除cell 
      this.mouseKey = null;
      this.data = flow_Data; // 保留原始数据
      this.renderData = flow_Data;
      this.time = null;
    
    }

    const initPage = ()=> {
      // 1、创建一个 position 为 relative 的 div 为toopltip创建遮罩层
      const div = document.createElement('div');
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.position = 'relative';
      this.ele.appendChild(div);
      this.ele = div;

      const svgStr =  '<svg viewBox="0 0 800 500"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" id="component-flow-pager_content">'+

                      '</svg>';
      const html = new DOMParser().parseFromString(svgStr, "text/xml");
      const svgPage = html.getElementsByTagName('svg')[0];
      const [ width, height ] = [this.ele.offsetWidth, this.ele.offsetHeight];
      svgPage.setAttribute('width', width);
      svgPage.setAttribute('height', height);
      this.ele.appendChild(svgPage);
      return svgPage;
    }

    initData(options);

    this.svgPage = initPage();

    this.PaperSize = { // 存储各个图形的大小信息
      eleWidth: this.ele.offsetWidth,       // dom width
      eleHeight: this.ele.offsetHeight,     // dom height
      pageWidth:  this.svgPage.getAttribute('viewBox').split(' ')[2] - 0,    // svgView width
      pageHeight: this.svgPage.getAttribute('viewBox').split(' ')[3] - 0,    // svgView height
      contentWidth: 0,  // 图形边界 witdh
      contentHeight: 0, // 图形边界 height
    };
  }

  setPaperSize(){
    this.PaperSize = { // 存储各个图形的大小信息
      eleWidth: this.ele.offsetWidth,       // dom width
      eleHeight: this.ele.offsetHeight,     // dom height
      pageWidth:  this.svgPage.getAttribute('viewBox').split(' ')[2] - 0,    // svgView width
      pageHeight: this.svgPage.getAttribute('viewBox').split(' ')[3] - 0,    // svgView height
      contentWidth: this.PaperSize || 0,  // 图形边界 witdh
      contentHeight: this.PaperSize || 0, // 图形边界 height
    };
  }

  // 总体注册
  regietser({type,content}){
  
    // 注册单元格
    const regietser_cell = content => {
      if( Object.prototype.toString.call(content) === '[object Object]' ){
        if( !content.render_type && this.target !== 'svg' ){
          console.warn('cell 的渲染对象需要定义为 svg、document、或cavance');
        }else{
          this.renderCellTypes.push( content );
        };
      }else  if( Object.prototype.toString.call(content) === '[object Array]' ){
        this.renderCellTypes = [ ...this.renderCellTypes, ...content ];
      }else{
        console.warn('cell 类型定义不正确，你需要定义一个cell对象或者cell对象数组');
      }
    }

    // 注册线条
    const regietser_line = content => {
      this.regietserRenderLine = content;
    }

    const mapAction = {
      cell: ()=> { regietser_cell( content ) },
      line: ()=> { regietser_line( content ) }
    };

    mapAction[type]();
  }


  render () {
    // 为每个单元格——实例化
    this.svgPage.innerHTML = '';
    this.dataFactory();
    this.LineArrList = [];
    this.renderCell();
    this.renderLine();
  }

  dataFactory(){
    this.renderData = this.mapData(( data, deep, parentTop, parent )=> {
      const { _render } = data;
      if(!_render){
        this.initCellData(data);
      }
      // 这些属性是需要外部维护的
      data.deep = deep; // 重写属性
      data.topArr = parentTop;  // 重写属性
      data.parent = parent;
      data.childrenList = [];
      const maxLeft = parent ? (parent.maxLeft  + parent.width ) :  0 ;
      data.maxLeft = maxLeft ;
      
      if(data.children && data.children.length) {
        this.mapData((item)=> {
          data.childrenList.push(item);
          return item;
        }, data.children)
      };
      return data;
    }, this.renderData);
  }

  /**
   * 初始化 单个 cellData
   * @param {*Object: cellData} data 
   */
  initCellData(data){
    const that = this;
    // 1_ 赋值 cell_factory 类
    const copyPropyty = {};
    for(let key in data ){
      if(cell.hasOwnProperty(key)){
        copyPropyty[key] = data[key]
      }
    };
    Object.defineProperties(data,Object.getOwnPropertyDescriptors(cell)); // 拷贝属性
    Object.keys( copyPropyty ).forEach(key=> {  data[key] = copyPropyty[key]}); 
    data.id =   '__' + Math.ceil(Math.random() * 1000 *1000 * 1000 * 1000);
    data.children = data.children || [];
    data.cell_sapce_width = this.spaceWidth || data.cell_sapce_width;
    data.cell_sapce_height = this.spaceHeight || data.cell_sapce_height;

    // 2_ 渲染定义的cell_render函数
    // 选择渲染的单元格
    const cell_templete = this.renderCellTypes.find(item=> item.name === data.cell_type ) || this.renderCellTypes[0];
    data = Object.assign(data, cell_templete);
    let isRender = false; // 避免触发set
    const isOpen = data.isOpen;

    // 3_ 定义数据驱动模型 设置isopen时请使用 _open 设置避免触发动画
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

    data.isOpen = isOpen;
    // 3_ 设置事件
    const { svg, bindEvent } = data;
    if( bindEvent ){
      bindEvent( { paper : this.svgPage.parentNode , ele:svg ,params : data,render : (...args)=> this.render(args), getClickCoordinate: ()=> this.getClickCoordinate() } );
    };

    // 4_ cell 单元格拖拽事件
    let appendData = null;
    let copyData =  Object.defineProperties({},Object.getOwnPropertyDescriptors(data));
    copyData.render = this.renderCellTypes.find(item=> item.name === 'insert_cell' ).render; // 改变他的render内容
    copyData._open = false;
    copyData.name = 'insert_cell';
    const moveEvent = (e)=> {
      if(e.stopPropagation) e.stopPropagation();
      if(e.preventDefault) e.preventDefault();
      e.cancelBubble=true;
      e.returnValue=false;
      const { movementX,movementY,layerX , layerY} = e;
      let [ x, y, width,height ] =  [ 'x', 'y', 'width','height' ].map(val=>  Number(svg.getAttribute(val)));
      const [paperX,paperY, Vwidth,Vheight, rate, Parperwidth, Pargerheight ] = this.scaleAnimaltion();
      const rateViewPaper = Vwidth /  Parperwidth; // 视图和真实px 比率

      // 4-1 设置鼠标对应的画布位置
      const [ mouseX, mouseY] = [ layerX * rateViewPaper + paperX , layerY * rateViewPaper + paperY ];
      // 设置方块跟随鼠标一起移动
      svg.setAttribute('x',mouseX - width / 2);
      svg.setAttribute('y',mouseY - height / 2);
  
      // 4-2-1 使用 节流函数 
      let XAiaxs , yAiaxs ;  
      let newappendData = undefined;  
      
      // 4-2-2 找出在 x y 上跟鼠标在同一水平轴上的单元格
      this.mapData((data)=> {
        let { parent, _left,  _top, height , width , label, cell_sapce_height, cell_sapce_width,name }  = data;
        height = height - cell_sapce_height;
        width = width - cell_sapce_height;
        const item = {
          parent, _left,  _top, height , width , data, mouseX, mouseY
        }
        if(name !== 'insert_cell' && _left < mouseX &&  mouseX  < (_left + width) && mouseY > (_top - height * 1.5 ) &&  mouseY < (_top + height * 2.5) ){ // 兄弟节点 
          XAiaxs = XAiaxs || item;
          const Xwidth = Math.min( Math.abs( mouseY - _top ), Math.abs( mouseY - _top - height) );
          const Xitem =  Math.min( Math.abs( mouseY - XAiaxs._top ), Math.abs( mouseY - XAiaxs._top - XAiaxs.height) );
          if( Xwidth < Xitem ){
            XAiaxs = item;
          }
        }
        if(name !== 'insert_cell' && _top < mouseY &&  mouseY <  (_top + height)  && mouseX > (_left + width) &&  mouseX < (_left + width * 1.8)  ){ // 子节点-优先级更高
          yAiaxs = yAiaxs || item;
          const Ywidth = Math.min( Math.abs( mouseX - _left ), Math.abs( mouseX - _left - width) );
          const Yitem =  Math.min( Math.abs( yAiaxs.mouseX - yAiaxs._left ), Math.abs( yAiaxs.mouseX - yAiaxs._left - yAiaxs.width) );
          if( Ywidth < Yitem ){
            yAiaxs = item;
          }
        }
        return data;
      }, this.renderData);

      // // 4-3 找出可以插入的节点
      if( yAiaxs ){ // yAiaxs的优先级更高
          newappendData = yAiaxs;
      }else if( XAiaxs && XAiaxs.parent ){
          let index = 0;
          index = XAiaxs.parent.children.findIndex(item=> item.id === XAiaxs.data.id);
          if(  mouseY > XAiaxs.data._top ){
            index += 1;
          }
          newappendData = XAiaxs;
          newappendData.insertIndex = index;
      }

      // // 4-4 没有已经插入的直接插入子节点，有的话判断是否时同一个节点，不是的话删除再插入
      if( newappendData ){
          // 判断是否是相同的节点
          if( !appendData || // 原本没有节点插入
              newappendData.insertIndex !== appendData.insertIndex || // 插入节点跟前插入的节点不是同一个index
              (newappendData.parent && appendData.parent && newappendData.parent.id !== appendData.parent.id )|| 
              newappendData.data.id !== appendData.data.id
            ){

            if( Number(newappendData.insertIndex) !== Number(newappendData.insertIndex)){ // 原本没有节点插入
              if( newappendData.data.children.length === 0){
                const data = newappendData.data;
                copyData._left = data._left + data.width;
                copyData._top =  data._top;
                copyData.svg.setAttribute('x', copyData._left);
                copyData.svg.setAttribute('y', copyData._top);
              }
            }else{
              const data = newappendData.parent;
              const insertIndex = newappendData.insertIndex;
              
              if( insertIndex === newappendData.parent.children.length){
                const insertItem = newappendData.parent.children[newappendData.parent.children.length - 1];
                copyData._left = insertItem._left;
                copyData._top =  insertItem._top + insertItem.height / 2;
                copyData.svg.setAttribute('x', copyData._left);
                copyData.svg.setAttribute('y', copyData._top);
              } else {
                const insertItem = newappendData.parent.children[insertIndex];
                copyData._left = insertItem._left;
                copyData._top =  insertItem._top - insertItem.height / 2;
                copyData.svg.setAttribute('x', copyData._left);
                copyData.svg.setAttribute('y', copyData._top);
              }
            }
            appendData = newappendData;
          }
      }
    };
    const event = (e)=> {
      setTimeout(()=> {
        moveEvent(e)
      },0)
    }
    let isDrage = false;
    svg.addEventListener('mousedown',(e)=> {
      if(e.stopPropagation) e.stopPropagation();
      if(e.preventDefault) e.preventDefault();
      this.PaperSize.clickEle = e;
      if(this.mouseKey === 'ControlLeft' || this.mouseKey === 'ControlRight'){
        isDrage = true;
        const { id, parent, svg }  = data;    
        const index = parent.children.findIndex((item)=> item.id === id );
        parent.children.splice(index,1);
        this.render();
        copyData._left = data._left;
        copyData._top = data._top;
        this.renderCell(copyData);
        data.isOpen = false;
        this.renderCell(data);
        this.svgPage.addEventListener('mousemove', moveEvent);
      }
    });
    svg.addEventListener('mouseup',(e)=> {
      this.svgPage.removeEventListener('mousemove', moveEvent);
      if(isDrage){
        isDrage = false; 
        if( appendData ){
          data._open = true;
          if( Number(appendData.insertIndex) === Number(appendData.insertIndex) ){
            appendData.parent.children.splice(appendData.insertIndex,0, data);   
          }else{
            appendData.data.children.push(data);
          }
          this.dataFactory();
          this.render();
        }
        this.svgPage.removeEventListener('mousemove', moveEvent);
      }
    });
    isRender = true;
  }

  /**
   * 将cell数据根据不同的 type 添加到页面当中：需要判断开启关闭状态；和是否在页面中
   * @param {*} data 有item表示独立渲染 默认使用 this.renderData;
   */
  renderCell(data){
    const cellArrList = []; // 新
    let contentWidth = 0;
    let contentHeight = 0;
    this.mapData((item)=> {
      const { svg, _left, _top, isOpen, height , width,cell_sapce_height} = item;
      item.svg.setAttribute('x', item._left);
      item.svg.setAttribute('y', item._top);
      this.svgPage.appendChild(item.svg);
      contentWidth = Math.max( contentWidth, _left + width);
      contentHeight = Math.max( contentHeight, _top + height);
      // cellArrList.push(item.svg);
      item.isInpager = true;
      return isOpen  && item ;
    }, data || this.renderData);

    if(data) return;

    this.PaperSize.contentWidth = contentWidth;
    this.PaperSize.contentHeight = contentWidth;

    // this.svgPage.setAttribute('viewBox',  `0  0 ${contentWidth} ${contentHeight}`);

    // 优化代码
    // cellArrList.forEach((svg)=>{
    //   const id = svg.getAttribute('id');
    //   const index = this.cellArrList.findIndex((g)=>{
    //     return (g.getAttribute('id')) === id;
    //   });

    //   if( index >= 0 ){
    //     this.cellArrList.splice(index,1)
    //   }else{
    //     this.svgPage.appendChild(svg);
    //   }
    // });
    
    // while( this.cellArrList.length ){
    //   try{
    //     const item = this.cellArrList.pop();
    //     if( this.svgPage.hasChildNodes(item) ) this.svgPage.removeChild(item);
    //   }catch(err){
    //     console.error(err);
    //   }
    // };

    // this.cellArrList = cellArrList;
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
        _left: startLeft + start.width - start.cell_sapce_width,
        _top: startTop + ( start.height - start.cell_sapce_height) / 2
      }
      end = {
        endId: end.id,
        _left : endLeft,
        _top: endTop + (end.height - end.cell_sapce_height) / 2 
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
      const { isOpen, svg, _left, _top, isInpager, id } = data;
      if( !isOpen ) closeDatList = closeDatList.concat(data.childrenList);
      const isIncloseItem = closeDatList.find(item=> item.id === id);
      if( isInpager ){ // 如果在画布中
        if(  isIncloseItem ){ // 关闭动作
          this.svgPage.removeChild(svg);
          data.isInpager = false;
        }else{
          if( svg ){
            this.animation({ svg, animation:[
              {attributeName: 'y',attributeType : 'XML' , to : _top, dur: 0.5, begin: '0.1', fill:'freeze' },
              {attributeName: 'x',attributeType : 'XML' , to : _left, dur: 0.5 , begin: '0.1', fill:'freeze' }
            ]});
          }
        }
      }else if(!isIncloseItem) {
        svg.setAttribute('x', _left);
        svg.setAttribute('y', _top);
        this.svgPage.appendChild(svg);
        data.isInpager = true;
      }

      return  data;
    },this.renderData);
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

  /**
   * 数据遍历函数
   * @param {数据处理函数；你需要返回一个数据的包装对象} func 
   * @param {this.mapData} data 
   * @param  {...any:需要传入func的参数} otherParams 
   * @returns 
   */
  mapData (func, data, deep = 0, parentTop = [], partent, ...otherParams){
    if( !data ) return;
    if( Object.prototype.toString.call(data) === '[object Object]'  ){
      const obj  = func(data, deep, parentTop, partent,...otherParams);
      if( obj.children ){
        obj.children = this.mapData(func, obj.children,  deep + 1, parentTop, obj , ...otherParams);
        return obj;
      }
      return data;     
    }else if( Object.prototype.toString.call(data) === '[object Array]' ){
      const arr = [];
      return data.map( (item ,index )=> {
        const res =  this.mapData(func, item,deep , parentTop.concat(arr),partent, ...otherParams);
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
    // 键盘事件
    // let mouseKey = null;
    const keyDownFunc = (event)=> {
      event = event || window.event;
      if (event.preventDefaulted) {
        return; // Do nothing if event already handled
      }
      const {key, code} = event;
      if( code && code !== this.mouseKey){
        this.mouseKey = code;
      }
    };
    window.addEventListener("keydown", keyDownFunc);
    const keyUpFunc = (event)=> {
      this.mouseKey = null;
    };
    window.addEventListener("keyup", keyUpFunc);


    // 为画布添加监听滚轮事件 
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
    this.svgPage.addEventListener(mousewheel,scrollFunc);
    // 画布拖拽事件 鼠标按下加空格触发
    const mouseMoveFunc = (e)=> {
      if( isMouseDown  && this.mouseKey === "Space" ) {
        let [x,y,Vwidth,Vheight,rate, width,height] = this.scaleAnimaltion();
        const { movementX,movementY} = e;
        const rateX = Vwidth / width;
        const rateY = Vheight / height;
        x -= movementX * rateX;
        y -= movementY * rateY;
        this.svgPage.setAttribute("viewBox", [x,y,Vwidth,Vheight].join(' '))     
      }
    }
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

  /**
   * 获取点击坐标时
   */
  getClickCoordinate(){
    return this.PaperSize;
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
          isOpen: true,
          children: [
            {
              label: '300',

              children: [
                {
                  label: '400'
                },
                {
                  label: '401'
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
  spaceHeight: 30 ,
  maxScale: 2,
  minSacle: 0.1
});

flow.regietser({ type: 'cell', content: [ base_cell, insert_cell]});
flow.regietser({ type: 'line', content: renderLine});

flow.render();

// setTimeout(()=> {
//   flow.renderData[0].isOpen = false;
// },1000)

console.log(flow, flow.renderData, flow.renderCellTypes );
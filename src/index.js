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

  initData({ 
    target,   // svg || document || cavance
    ele,      // 
    flow_Data, // 渲染数据
    maxScale,
    minSacle
  }){
    this.target = target;
    this.renderCellTypes = [];
    this.ele = document.getElementById(ele);
    this.maxScale = maxScale;
    this.minSacle = minSacle;
    
    this.renderData = this.mapData((data, deep, parentTop)=> {
      data.id =   '__' + Math.ceil(Math.random() * 1000 *1000 * 1000);
      data.__self = data;
      Object.defineProperties(data,Object.getOwnPropertyDescriptors(cell));
      data.deep = deep; // 重写属性
      data.topArr = parentTop;  // 重写属性
      return data;
    }, flow_Data);
  }

  /**
   * 注册画布
   */  
  initPage(){
    const svgStr =  '<svg viewBox="0 0 500 300"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" id="component-flow-pager_content">'+

                    '</svg';
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
    // 选择渲染的单元格
    const cell_templete = this.renderCellTypes[0];

    // 存储渲染的连线数据对象 
    let lineArr = [];

    // 为每个单元格添加函数对象
    this.renderData = this.mapData(( data )=> {
      Object.assign(data, cell_templete);
      setTimeout(()=> {
        console.log('newData',data, data.top, data._child_max_width );
      }, 200);
      if( data.children && data.children.length > 0){
        const childCounts = data.children.length;
        data.children.forEach(item=> {
          lineArr.push({
            start: data,
            end : item
          })
        })
      }
      return data;
    }, this.renderData);

    // // 重新计算连线的起点和终点 -- 因为
    lineArr = lineArr.map( ( value )=> {
      let { start, end } = value;
      // debugger;
      start = {
        left: start.left + start.width - start.cell_sapce_width,
        top: start.top + start.height / 2
      }
      // debugger
      end = {
        left : end.left,
        top: end.top + end.height / 2 
      }
      return { start, end };
    })

    this.renderLine(lineArr);
    this.renderCell();
  }

  renderCell(){
    this.mapData((item)=> {
      const { svg, left, top } = item;
      svg.setAttribute('x', left);
      svg.setAttribute('y', top);
      this.svgPage.appendChild(svg);

      return item;
    }, this.renderData)
  }

  renderLine(lineArr){
    const lineAvgArr = this.regietserRenderLine(lineArr);
    lineAvgArr.forEach(line=> {
      this.svgPage.appendChild(line);
    })
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
      }
      return obj;
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
    this.svgPage.addEventListener('mousemove', mouseMoveFunc)
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
      // type: '',
      children: [
        {
          label: '200',
        },
        {
          label: '201',
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
  maxScale: 2,
  minSacle: 0.8
});

flow.regietser({ type: 'cell', content: base_cell });
flow.regietser({ type: 'line', content: renderLine})

flow.render();

console.log(flow, flow.renderData, flow.renderCellTypes );
require("./style/comme.sass");
import { cell } from "./utils/cell_factory";
import { base_cell } from "./cell/cell_render.js";//
import { renderLine } from "./lines/line_render.js";//


const component_flow = class {
  constructor(options){
    this.initData(options)
    this.initPage(); // 初始化画布；
  }

  initData({ 
    target,   //s vg || document || cavance
    ele,      // 
    flow_Data // 渲染数据
  }){
    this.target = target;
    this.renderCellTypes = [];
    this.ele = document.getElementById(ele);
    
    this.renderData = this.mapData((data, deep, parentTop)=> {
      data.id =   '__' + Math.ceil(Math.random() * 1000 *1000 * 1000);
      data.__self = data;
      Object.defineProperties(data,Object.getOwnPropertyDescriptors(cell));
      data.deep = deep; // 重写属性
      data.topArr = parentTop;  // 重写属性
      // console.log('data' , data, deep, parentTop);
      return data;
    }, flow_Data);
  }

  /**
   * 注册画布
   */  
  initPage(){
    const svgStr = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">'+

                  '</svg';
    const html = new DOMParser().parseFromString(svgStr, "text/xml");
    this.svgPage = html.getElementsByTagName('svg')[0];

    this.ele.appendChild(this.svgPage);
    console.log( this.svgPage );
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
    console.log( lineAvgArr);
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
  ]
});

flow.regietser({ type: 'cell', content: base_cell });
flow.regietser({ type: 'line', content: renderLine})

flow.render();

console.log(flow, flow.renderData, flow.renderCellTypes );
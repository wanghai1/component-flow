require("./style/comme.sass");
import { cell } from "./utils/cell_factory";


export const component_flow = class {
  constructor({
    ele ,     // 
    flow_Data // 渲染数据
  }){
    this.ele = document.getElementById(ele);

    const fib = ( flow_Data, deep )=>{ // 递归使用 cell 对象包装 原始对象 
      flow_Data.map((item ,i)=>{
        if( Object.prototype.toString(item) === '[object Object]'){ // 如果他是一个对象的话--直接使用对象包装他
          item.id = deep + '__' + i;
          item.__self = item; // 便于拿到自己
          return {
            ...cell,
            ...item
          };
        }

        if( Object.prototype.toString(item) === '[object Object]' ){
          return fib(item, deep + '__' + i);
        }

        if( typeof item === 'String' ){
          const cell_ = { 
            text: item,
            id: deep + '__' + i
          };
          cell.__self = self;

          return cell_;
        }
      });
    };
    
    // 初始化数据
    this.renderData = fib(flow_Data, '0');

    this.initPage(); // 初始化画布；

    this.regietser();
    
  }

  /**
   * 注册画布
   */
  initPage(){

  }

  render () {
    
    
  }
  
  // ({
  //   eleId, // 绑定的id对象
  //   flow_Data, // 渲染的数据
  // })=>{
  //   const ele = document.getElementById(eleId);

  //   return {
  //     ele,
  //   }
  // }

  bindEvent(){

  }

  // Life: {
    
  // }
}
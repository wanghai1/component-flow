// 定时数据的共同行为
// _表示不希望向外暴露的属性即私有属性
export const cell = {
  id: '',
  deep: 0,
  topArr: [],
  top: '',
  left: 0,
  right: 0,
  width: '',
  height: 0,
  render: '',
  _render:undefined,
  svg: undefined,
  // _child_max_height: '', // 子孩子中最大的宽度
  cell_type: 'base_cell',
};

Object.defineProperty(cell, 'render',{
  set: function(render_func){
    if( render_func && Object.prototype.toString.call(render_func) === '[object Function]' ){
      const html = new DOMParser().parseFromString(render_func(this), "text/xml");
      const svg = html.getElementsByTagName('svg')[0];
      this.svg = svg;
      this.width = this.svg.getBBox().width || this.svg.width.baseVal.value;
      this.height = this.svg.getBBox().height || this.svg.height.baseVal.value;
      // this._child_max_height = this.width;
    }
    this._render = render_func;
  }
})

// Object.defineProperty( cell , 'svg', {
//   enumerable: true,
//   get : function(){
//     if( this._svg ){
//       return this._svg
//     };
//     // debugger;
//     if( this.render && Object.prototype.toString.call(this.render) === '[object Function]'){
//       const html = new DOMParser().parseFromString(this.render(this), "text/xml");
//       const svg = html.getElementsByTagName('svg')[0];
//       if( svg ){
//         this._svg = svg;
//         // this.width = this._svg.getBBox().width || this._svg.width.baseVal.value;
//         this.height = this._svg.getBBox().height || this._svg.height.baseVal.value;
//       }
//       return svg;
//     }
//     return undefined;
//   }
// });

// Object.defineProperty( cell , 'width', {
//   enumerable: true,
//   get : function(){
//     if( this._svg ){
//       return this._svg.getBBox().width || this._svg.width.baseVal.value;
//     };
//     return 0;
//   }
// });

Object.defineProperty( cell , '_child_max_height', {
  enumerable: true,
  get : function(){
    if( this.children ){
      return this.children.reduce((pre,next)=>{
        return pre + ( next._child_max_height || next.height)
      },0);
    };
    return this.height;
  }
});

Object.defineProperty( cell , 'top', {
  enumerable: true,
  get : function(){
    const top_arr_width = this.topArr.reduce((pre,next)=> {
      return pre + next._child_max_height
    },0);
    return Math.floor((this._child_max_height   - this.height)  / 2 + top_arr_width); 
  }
});

Object.defineProperty( cell , 'left', {
  enumerable: true,
  get : function(){
    return this.deep * ( this.width )
  }
});



export const line = {
  from: [],
  to: [],
  render: function(){

  }
}
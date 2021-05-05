// 定时数据的共同行为
// _表示不希望向外暴露的属性即私有属性
export const cell = {
  id: '',
  topArr: [],
  top: '',
  left: 0,
  right: 0,
  width: '',
  height: 0,
  // render: '',
  cell_sapce_width: 20,  // 默认宽度间距
  cell_sapce_height: 40,  // 默认高度间距
  _render:undefined,
  isInpage: false,       // 是否已经渲染在页面中
  svg: undefined,
  isOpen: true,          // 
  _open: true,           // 
  _child_max_height: '', // 子孩子中最大的宽度
  cell_type: 'base_cell',
};

// 当为render赋值的时候设置 width 和 Hieght 的值
Object.defineProperty(cell, 'render',{
  set: function(render_func){
    if( render_func && Object.prototype.toString.call(render_func) === '[object Function]' ){
      const html = new DOMParser().parseFromString(render_func(this), "text/xml");
      const svg = html.getElementsByTagName('svg')[0];
      svg.setAttribute('id', this.id);
      this.svg = svg;
      this.width = (this.svg.getBBox().width || this.svg.width.baseVal.value) + this.cell_sapce_width;
      this.height = (this.svg.getBBox().height || this.svg.height.baseVal.value) + this.cell_sapce_height;
    }
    this._render = render_func;
  }
})

Object.defineProperty( cell , '_child_max_height', {
  enumerable: true,
  get : function(){
    if( this.children && this.children.length && this._open ){
      // console.log(this.children);
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
    const a = this._child_max_height === this.height ? 0 : ((this._child_max_height   - this.height)  / 2);
    return Math.floor ( a + top_arr_width); 
  }
});

Object.defineProperty( cell , 'left', {
  enumerable: true,
  get : function(){
    return this.deep * ( this.width )
  }
});

// Object.defineProperty( cell , 'isOpen', {
//   enumerable: true,
//   set : function(val){
//     this._open = val
//   },
//   get: function(){
//     return this._open
//   }
// });


export const line = {
  from: [],
  to: [],
  render: function(){

  }
}
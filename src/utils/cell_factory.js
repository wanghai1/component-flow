// 定时数据的共同行为
export const cell = {
  id: '',
  left: '',
  right: '',
  width: '',
  height: '',
  text: '',
  svg: '',
  render_type: '',
  // render: '', // String
}

Object.defineProperty( cell , 'svg', {
  get : ()=>{
   if( cell.render ){
     var svg = new DOMParser().parseFromString(cell.render, "text/xml");
     return svg;
   }
   return null;
  }
})

// Object.defineProperty( cell , 'width', {
//   get : ()=>{
//    if( cell.render ){
//      var svg = new DOMParser().parseFromString(cell.render, "text/xml");

//      return svg.
//    }
//    return 0;
//   }
// })

export const line = {
  from: [],
  to: [],
  render: function(){

  }
}
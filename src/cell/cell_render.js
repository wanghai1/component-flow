/*
 * @Author: your name
 * @Date: 2021-05-06 13:13:43
 * @LastEditTime: 2021-05-13 14:09:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \component-flow\src\cell\cell_render.js
 */
export const base_cell = {
  render_type: 'svg',
  name:'base_cell',
  render:(params)=> {
    // console.log(pa);
    return '<svg width="115" height="55" xmlns="http://www.w3.org/2000/svg" id="base_cell">'+
                '<rect stroke="#000" id="svg_1" height="52" width="111" y="2" x="2" stroke-width="1.5" fill="#fff"> </rect>'+
                '<text xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="24" id="svg_7" y="33.55" x="31" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000000">'+
                  params.label + 
                '</text>'+
                '<rect id="close" x="102" y="25" stroke="#000" height="5" width="10" > </react>'+
            '</svg>'
  },
  bindEvent: ({paper , ele,params,setData })=> {
    let i = 0;
    ele.addEventListener('click', (event)=> {
      params.children.push({label: i++});
      // params.children.pop();
      setData();
      event.stopPropagation();
      event.preventDefault();
    }, false);
    

    const openEle = ele.getElementById('close');
    openEle.addEventListener('click',(event)=>{
      params.isOpen = !params.isOpen;
      event.preventDefault();
      event.stopPropagation();
    }, false);
  }
}
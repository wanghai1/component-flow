/*
 * @Author: your name
 * @Date: 2021-05-06 13:13:43
 * @LastEditTime: 2021-06-09 14:13:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \component-flow\src\cell\cell_render.js
 */
export const base_cell = {
  render_type: 'svg',
  name:'base_cell',
  contentWidth: 111,
  contentHeight: 55,
  render:(params)=> {
    const width = 111 + Math.ceil(Math.random() * 50);
    const height = 55 + Math.ceil(Math.random() * 20);

    return `<div style="width:110px;height:55px;background:red;user-select:none" xmlns="http://www.w3.org/1999/xhtml">`  +
              `${params.label }`+
              `<div id="close"> 关闭 </div>`+
           `</div>`
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
    

    // const openEle = ele.getElementById('close');
    // openEle.addEventListener('click',(event)=>{
    //   params.isOpen = !params.isOpen;
    //   event.preventDefault();
    //   event.stopPropagation();
    // }, false);
  }
}
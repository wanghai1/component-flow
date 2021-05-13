export const insert_cell = {
  render_type: 'svg',
  name:'insert_cell',
  render:(params)=> {
    return '<svg width="115" height="55" xmlns="http://www.w3.org/2000/svg" id="base_cell">'+
                '<rect stroke="#000" id="svg_1" height="2" width="111" y="25" x="2" stroke-width="1.5" fill="#fff"> </rect>'+
                // '<rect id="close" x="102" y="29" stroke="#000" height="5" width="10" > </react>'+
            '</svg>'
  },
  bindEvent: ({paper , ele,params,setData })=> {

  }
}
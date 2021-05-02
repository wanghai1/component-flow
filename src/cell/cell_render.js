export const base_cell = {
  render_type: 'svg',
  name:'base_cell',
  // label: '',
  render:(params)=> {
    console.log('params', params);
    return '<svg width="115" height="55" xmlns="http://www.w3.org/2000/svg" id="base_cell">'+
                '<rect stroke="#000" id="svg_1" height="51" width="111" y="2" x="2" stroke-width="1.5" fill="#fff"/>'+
                '<text xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="24" id="svg_7" y="33.55" x="31" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000000">'+
                  params.label + 'ss'+
                '</text>'+
            '</svg'
  },
  bindEvent: (ele)=> {

  }
}
export const renderLine = ( item )=> {
  // return lineArr.map( item=> {
    const { start, end } = item;
    const center_left = Math.ceil( start.left + (end.left - start.left) / 4 * 1 );
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const d = `M${start.left} ${start.top} `+
    `C ${start.left} ${start.top}, ${center_left -10 } ${start.top}, ${center_left} ${start.top} `+
    `S  ${center_left} ${end.top}, ${end.left} ${end.top}`;
    // console.log('d', d);
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'black');
    path.setAttribute( 'fill', 'transparent')
    // 绘制三次贝塞尔曲线
    // const path = `<path d= stroke="black" fill="transparent"/>`
    return path;
  // })
  
}
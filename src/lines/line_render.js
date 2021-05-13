export const renderLine = ( item )=> {
  // return lineArr.map( item=> {
    const { start, end } = item;
    const center_left = Math.ceil( start._left + (end._left - start._left) / 4 * 1 );
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const d = `M${start._left} ${start._top} `+
    `C ${start._left} ${start._top}, ${center_left -10 } ${start._top}, ${center_left} ${start._top} `+
    `S  ${center_left} ${end._top}, ${end._left} ${end._top}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'black');
    path.setAttribute( 'fill', 'transparent')
    // 绘制三次贝塞尔曲线
    // const path = `<path d= stroke="black" fill="transparent"/>`
    return path;
  // })
  
}
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
    path.setAttribute( 'fill', 'transparent');

    let length = Math.pow(
      Math.pow(Math.abs(start._left - end._left),2) + Math.pow(Math.abs(start._top - end._top),2)
      ,0.5
    );
    
    let animateMotionStr = '';
    for(let i=0; i*30 <= length; i++) {
      animateMotionStr += `<circle  r="2" fill="blue" stroke="black" stroke-width="1">
        <animateMotion path="${d}" begin="${i}s" dur="3s" rotate="auto" additive="sum"  repeatCount="indefinite"/>
        <animateTransform attributeName="transform" begin="${i}s" dur="3s"  type="scale" from="1" to="2" repeatCount="indefinite"/>
      </circle>`
    };
    
    // 绘制三次贝塞尔曲线
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" > ${animateMotionStr}+
                    <path d="${d}" stroke-width="1" fill="none" stroke="black" />
                  </svg>`;
    const html = new DOMParser().parseFromString(svgStr, "text/xml");
    const svg = html.getElementsByTagName('svg')[0];

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(path);
    g.appendChild(svg);

    return svg;
  // })
  
}
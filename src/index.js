require("./style/comme.sass");


export default function add( a , b){
  return a + b;
}

const app = document.getElementById('app');



setTimeout(()=>{
  app.innerHTML = '你好'
},2000);
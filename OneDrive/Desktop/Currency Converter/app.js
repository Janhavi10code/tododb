const BASE_URL="https://api.frankfurter.dev/v1/latest?";
// https://api.frankfurter.app/latest?amount=100&from=USD&to=INR

const dropdowns=document.querySelectorAll(".dropdown select");
const btn=document.querySelector("button");
const fromcurr=document.querySelector(".from select");
const tocurr=document.querySelector(".to select");
const msg=document.querySelector(".msg");

for(let select of dropdowns){
    for(currcode in countryList){
        let newoption=document.createElement("option");
        newoption.innerText=currcode;
        newoption.value=currcode;
        if(select.name==="from" && currcode==="USD"){
            newoption.selected="selected";
        }
        else if(select.name==="to" && currcode==="INR"){
            newoption.selected="selected";
        }
        
        select.append(newoption);
    }
    select.addEventListener( "change", (evt)=>{
        updateFlag(evt.target);
    });

}


const updateFlag=(element)=>{
    let currcode=element.value;
    // console.log(currcode);
    let countrycode=countryList[currcode];
    let newsrc=`https://flagsapi.com/${countrycode}/flat/64.png`;
    let img=element.parentElement.querySelector("img");
    img.src=newsrc;
}


btn.addEventListener("click", async (evt)=>{
    evt.preventDefault();
    let amount=document.querySelector(".amount input");
    let amtval=amount.value;
    if(amtval==="" || amtval<1){
        amtval=1;
        amount.value="1";
    }

    // console.log(fromcurr.value, tocurr.value);
    const URL = `${BASE_URL}amount=${amtval}&from=${fromcurr.value}&to=${tocurr.value}`;
    let response= await fetch(URL);
    let data=await response.json();
    let finalAmount=data.rates[tocurr.value];
    let date=data.date;
    // console.log(date);
    msg.innerHTML=`<strong>${amtval}</strong> ${fromcurr.value} = <strong>${finalAmount}</strong> ${tocurr.value}`;
        

});





































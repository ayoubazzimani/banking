import fetch from 'node-fetch';

let host="http://localhost:3000";
let username = 'BankinUser';
let password = '12345678';
let clientId = 'BankinClientId';
let secret = 'secret';


async function  getRefreshToken(){
    let basic = 'Basic ' + btoa(clientId+':'+secret);
    let response = await fetch(host+'/login', 
        {
            method:'POST',
            headers: {'Content-Type': 'application/json', 'Authorization' : basic },
            body: JSON.stringify({
                "user": username,
                "password": password
            })
       });
       const data = await response.json();
       return data.refresh_token;
}


async function  getAccesToken(){
    let token_ref= await getRefreshToken();

    let response = await fetch(host+'/token', 
        {
            method:'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=refresh_token&refresh_token='+token_ref
           
       });
       const data = await response.json();
       return data.access_token;
}


async function  getAccounts(AccesToken){

    let response = await fetch(host+'/accounts', 
        {
            method:'GET',
            headers: {'Content-Type': 'application/json' , 'Authorization' : 'Bearer '+AccesToken}           
       });
       const data = await response.json();

       return data;
}


async function  getTransactions(acc_number, AccesToken ){

    let response = await fetch(host+'/accounts/'+acc_number+'/transactions', 
        {
            method:'GET',
            headers: {'Content-Type': 'application/json' , 'Authorization' : 'Bearer '+AccesToken}           
       });
       const data = await response.json();
       return data;
}


let access_token= await getAccesToken();
let Accounts = await getAccounts(access_token);
let Transactions = await getTransactions( '000000001',access_token);


let account;
for (let index = 0; index < Accounts.account.length; index++) {
     account = Accounts.account[index];
    let Transactions = await getTransactions( account.acc_number ,access_token);

    Accounts.account[index]['transactions'] =Transactions.transactions.map( ({label, amount, currency}) => ({label, amount, currency}) );  
}

let Results = Accounts.account.map( ({acc_number, amount, transactions}) => ({acc_number, amount, transactions}) );
console.log(  JSON.stringify(Results, null, 4)  )
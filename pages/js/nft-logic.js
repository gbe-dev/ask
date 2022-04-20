Moralis.start({ serverUrl: "https://dod24uqsbvvz.usemoralis.com:2053/server", appId: "CszzABU8S9MnGhaW6t343lbY2bJVxGuQskj4yadC"}); 
var token_id_req = getTokenID(getRandomInt(1, 10395));
const contractid = "0x7037843d739D846CdCe3A6839A80f7D70b60b99A";
const nft_market_place_address = "0x9C064C696172377c9B532021D04635aC92329E5E" 
const options = { address: contractid, token_id: token_id_req, chain: "eth", limit: 30 };
const web3 = new Web3(window.ethereum);
var NFTObject = {};

async function getUSDRate() {
    $.get(API_CRYPTOCOMPARE_USD, function(data) {
        console.log("Value of ether now " + data.USD);
        NFTObject.USDrate = data.USD;
    }).catch(err => console.error("Error while loading USD Rare" + err)); 
}

async function main() {
    await getUSDRate();
    const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
    const metadata =  JSON.parse(tokenIdMetadata.metadata);
    const transfersbytokenid = await Moralis.Web3API.token.getWalletTokenIdTransfers(options);
    let userID = null;
    
    //const userID = walletlogin();
    if (document.body.id != "listings-01"){
        displayTokenData(tokenIdMetadata);
        displayMetadata(token_id_req, userID);
        displayTokenLogs(getTokenLogs(transfersbytokenid.result));            
        displayCollectionFeatures();
        
        populateOfferings(contractid, token_id_req);
    }
    else {
        console.log(NFTObject.USDrate);
        populateOfferingsMerged(contractid, token_id_req);
        //raribleCreateSellOrder();
    }
    //displayPrintsLogs(token_id_req);
    //populateOfferings();    
}
main();


async function walletlogin(){
    if (Moralis.User.current() != null) { console.log("Already logged in ("+Moralis.User.current().get('ethAddress')+")"); return Moralis.User.current() ; }
    const loginobject = await Moralis.authenticate();
    console.log("Attempted to loggin, result:"); 
    console.log(loginobject);
    if (loginobject != null) { return Moralis.User.current(); }
}


// Offerings 
function getOfferingObjects(array){
    let offerings = [];
    for (i=0;i<array.length;i++){
        offerings.push(generateOfferingDisplay(array[i].offeringId,array[i].offerer,array[i].block_timestamp,array[i].price))
    }
    return offerings;
}

function displayOfferings(data){
    var fulllogdisplay = "";
	if (data.length > 0) {
		fulllogdisplay = "<table id=\"filter\" class=\"table\"><thead> <tr> <th scope=\"col\">Offered by</th> <th scope=\"col\">Date</th> <th scope=\"col\">Price</th> <th scope=\"col\">Status</th> </tr> </thead> <tbody>";
        for (i=0;i<data.length;i++){
            fulllogdisplay += data[i];
        }
        fulllogdisplay += "</tbody></table>";
		document.getElementById('offeringList').innerHTML = fulllogdisplay;
	}
}

function cleanOfferings(){
    document.getElementById('offeringList').innerHTML = "No listing yet";
}

function generateOfferingDisplay(id, offerer, listingdate, listingprice){
    var salepricedisplay = "<img alt=\"ETH\" src=\"images/eth.svg\" width=\"10\"> " + listingprice;
    var transactiondatedisplay = formatdatelog(listingdate);
    var offererdisplay = offerer.substring(2,8).toUpperCase();
    if (Moralis.User.current().get('ethAddress') == offerer){offererdisplay = "You";}
    
    const offeringDisplay = `<tr><td><i class="fa fa-exchange" aria-hidden="true"></i> ${offererdisplay}</td>
    <td><span>${transactiondatedisplay}</span></td>
    <td><span>${salepricedisplay}</span></td>
    <td><a href="#" onclick="buyNFT(this);"><span>Buy</span></a></td></tr>`
    return offeringDisplay;
}

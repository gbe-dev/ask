Moralis.start({ serverUrl: "https://dod24uqsbvvz.usemoralis.com:2053/server", appId: "CszzABU8S9MnGhaW6t343lbY2bJVxGuQskj4yadC"}); 

var token_id_req = getTokenID(getRandomInt(1, 10395));
const nft_market_place_address = "0x9C064C696172377c9B532021D04635aC92329E5E" 
const options = { address: "0x7037843d739D846CdCe3A6839A80f7D70b60b99A", token_id: token_id_req, chain: "eth", limit: 30 };
const web3 = new Web3(window.ethereum);

console.log("Testnet - Activated");

         async function main() {
            const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
            const metadata =  JSON.parse(tokenIdMetadata.metadata);
            const transfersbytokenid = await Moralis.Web3API.token.getWalletTokenIdTransfers(options);
            let userID = null;
            //const userID = walletlogin();

            displayTokenData(tokenIdMetadata);
            displayMetadata(token_id_req, userID);
            displayTokenLogs(getTokenLogs(transfersbytokenid.result));            
            displayCollectionFeatures();
            displayPrintsLogs(token_id_req);
            
            populateOfferings();
         }
         main();

async function walletlogin(){
    if (Moralis.User.current() != null) { console.log("Already logged in ("+Moralis.User.current().get('ethAddress')+")"); return Moralis.User.current() ; }
    const loginobject = await Moralis.authenticate();
    console.log("Attempted to loggin, result:"); 
    console.log(loginobject);
    if (loginobject != null) { return Moralis.User.current(); }
}

function getTokenID(defaultvalue) {
	let params = (new URL(document.location)).searchParams;
	if (params.has('tokenid')) {
		if (parseInt(params.get('tokenid')) != NaN) {
			return params.get('tokenid')
		};
	}
	return defaultvalue;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
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
    var transactiondatedisplay = formatdate(listingdate);
    var offererdisplay = offerer.substring(2,8).toUpperCase();
    if (Moralis.User.current().get('ethAddress') == offerer){offererdisplay = "You";}
    

    const offeringDisplay = `<tr><td><i class="fa fa-exchange" aria-hidden="true"></i> ${offererdisplay}</td>
    <td><span>${transactiondatedisplay}</span></td>
    <td><span>${salepricedisplay}</span></td>
    <td><a href="#" onclick="buyNFT(this);"><span>Buy</span></a></td></tr>`
    return offeringDisplay;
}

async function populateOfferings(){
    let offeringArray = await getOfferings();
    let offerings = await getOfferingObjects(offeringArray);
    displayOfferings(offerings);
}

async function getOfferings(){
    const queryAll = new Moralis.Query("PlacedOfferingsTwo");
    queryAll.equalTo("tokenId", token_id_req);
    const data = await queryAll.find()
    offeringArray = [];
    console.log("Get offerings");
    
    for (let i=0; i< data.length; i++){
        let flag = await isOfferingClosed(data[i].get("offeringId"));
        if (!flag) {
            //const metadataInfo = await fetch(data[i].get("uri"));
            //const metadata = await metadataInfo.json();
            //console.log(metadata.data["name"]);
            const offering = {"offeringId":data[i].get("offeringId"),"offerer":data[i].get("offerer"),"hostContract":data[i].get("hostContract"),"tokenId":data[i].get("tokenId"),"price":web3.utils.fromWei(data[i].get("price")),"image":"","name":"","block_timestamp":data[i].get("block_timestamp")}
            offeringArray.push(offering)
        }
    }
    return offeringArray;
}

//Display NFT Functions

async function populateNFTs(){
    const localNFTs = await getNFTs().then(function (data){
        let nftDisplays = getNFTObjects(data);
        console.log(nftDisplays);
        displayUserNFTs(nftDisplays);
    });
}

async function getNFTs(){
    const queryAll = new Moralis.Query("PolygonNFTOwners");
    queryAll.equalTo("owner_of", ethereum.selectedAddress);
    const data = await queryAll.find()
    nftArray = [];
    for (let i=0; i< data.length; i++){
        const metadataInfo = await fetch(data[i].get("token_uri"));
        const metadata = await metadataInfo.json();
        const nft = {"object_id":data[i].id, "token_id":data[i].get("token_id"),"token_uri":data[i].get("token_uri"),"contract_type":data[i].get("contract_type"),"token_address":data[i].get("token_address"),"image":metadata["image"],"name":metadata["name"],"description":metadata["description"]}
        nftArray.push(nft)
    }
    return nftArray;
}

function displayUserNFTs(data){
    let entryPoint = 0;
    let rowId = 0;
    for (i=0;i<data.length;i+=3){
        let row = `<div id="row_${rowId}" class="row"></div>`;
        document.getElementById('NFTLists').innerHTML += row;
        for (j=entryPoint;j<=entryPoint+2;j++){
            if (j< data.length){
            document.getElementById("row_"+rowId).innerHTML += data[j];
            }
        }
        entryPoint += 3;
        rowId += 1;
    }
}

//Real Time Updates
async function subscribeOfferings(){
    let query = new Moralis.Query("PlacedOfferings");
    subscriptionAlerts = await query.subscribe();
    subscriptionAlerts.on('create', (object) => {
        cleanOfferings();
        populateOfferings();
    });
}

async function subscribeBuys(){
    let query = new Moralis.Query("ClosedOfferings");
    subscriptionAlerts = await query.subscribe();
    subscriptionAlerts.on('create', (object) => {
        cleanOfferings();
        populateOfferings();
        populateBalance();
    });
}

async function subscribeUpdateNFTs(){
    let query = new Moralis.Query("PolygonNFTOwners");
    subscriptionAlerts = await query.subscribe();
    subscriptionAlerts.on('update', (object) => {
        cleanNFTList();
        populateNFTs();
    });
}

//Display Balance Functions
async function getBalance(_address){
    const params =  {address: _address}
    const balance = await Moralis.Cloud.run("getBalance", params);
    return(balance);
}

async function populateBalance(){
    const presentBalance = await getBalance(ethereum.selectedAddress);
    const formatedBalance = "Your Market Place Balance is " + Moralis.Units.FromWei(presentBalance) + " ETH"
    document.getElementById("balance").innerHTML = formatedBalance;
}

function cleanNFTList(){
    document.getElementById('NFTLists').innerHTML = "";
}

function generateNFTDisplay(id, name, description, uri){
    const nftDisplay = `<div id="${id}" class="col-lg-4 text-center">
                            <img src=${uri} class="img-fluid rounded" style="max-width: 30%">
                            <h3>${name}</h3>
                            <p>${description}</p>
                            <button id="button_${id}" class="btn btn-dark" onclick="selectNFT(this);">Select</button>
                        </div>`
    return nftDisplay;
}

function getNFTObjects(array){
    let nfts = [];
    for (i=0;i<array.length;i++){
        nfts.push(generateNFTDisplay(array[i].object_id,array[i].name,array[i].description,array[i].image))
    }
    return nfts;
}

async function selectNFT(nftObject){
    const nftId = nftObject.parentElement.id;
    let nft = window.nftArray.find(object => object.object_id == nftId);
    const nftDisplay = `<div id="${nft.object_id}" class="text-center">
                            <img src=${nft.image} class="img-fluid rounded" style="max-width: 40%">
                            <h3>${nft.name}</h3>
                            <p>${nft.description}</p>
                            <div id="sellActions">
                                <input id="price" type="text" class="form-control mb-2" placeholder="Price"> 
                                <button id="sellButton"class="btn btn-dark btn-lg btn-block mb-2" id="sell" onclick="offerNFT(this);">Offer for Sale</button>
                            </div>
                        </div>`
    document.getElementById("featured_nft").innerHTML = nftDisplay;
    nftOffered = await isNFTOffered(nft.token_address,nft.token_id);
    if (nftOffered){
        document.getElementById("sellActions").remove();
    }
}

async function isNFTOffered(hostContract, tokenId){
    let offering_exist = true;
    let offering_closed = false;
    const queryAll = new Moralis.Query("PlacedOfferings");
    queryAll.equalTo("hostContract", hostContract);
    queryAll.equalTo("tokenId", tokenId);
    const data = await queryAll.find();
    data.length > 0? offering_exist = true: offering_exist = false;
    for (let i=0; i< data.length; i++){
        offering_closed = await isOfferingClosed(data[i].get("offeringId"));
    }
    const result = offering_exist && !offering_closed
    return result;
}

//Display Offering Functions


async function isOfferingClosed(offeringId){
    const queryAll = new Moralis.Query("ClosedOfferings");
    queryAll.equalTo("offeringId", offeringId);
    const data = await queryAll.find()
    data.length > 0? result = true: result = false;
    return result;
}



async function selectOffering(offeringObject){
    const offeringId = offeringObject.parentElement.parentElement.id;
    let offering = window.offeringArray.find(offering => offering.offeringId == offeringId);
    const offeringDisplay = `<div id="${offering.offeringId}" class="text-center">
                            <img src=${offering.image} class="img-fluid rounded" style="max-width: 40%">
                            <h3>${offering.name}</h3>
                            <h3>${offering.price + " ETH"}</h3>
                            <div id="buyActions">
                                <button id="buyButton"class="btn btn-dark btn-lg btn-block mb-2" onclick="buyNFT(this);">Buy</button>
                            </div>
                        </div>`
    document.getElementById("featured_nft").innerHTML = offeringDisplay;
    if (offering.offerer == ethereum.selectedAddress){
        document.getElementById("buyActions").remove();
    }
}


//Sell NFT Funtions

async function offerNFT(context){
    let nftId = context.parentElement.parentElement.id;
    let nft = window.nftArray.find(object => object.object_id == nftId);
    const price = document.getElementById("price").value;
    const contract = nft.token_address;
    const tokenId = nft.token_id;
    context.setAttribute("disabled",null);
    const approval = await approveMarketPlace(contract, tokenId);
    const tx_approval = `<p> Approval transaction ${approval}</p>`
    context.parentElement.innerHTML = tx_approval;
    const offering = await placeOffering(contract,tokenId, price);
    console.log(offering)
}

async function placeOffering(_hostContract, _tokenId, _price) {
    const params =  {hostContract: _hostContract,
                    offerer: ethereum.selectedAddress,
                    tokenId: _tokenId,
                    price: _price
    }
    const signedTransaction = await Moralis.Cloud.run("placeOffering", params);
    fulfillTx = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  	return fulfillTx;
}

async function approveMarketPlace(hostContract, tokenId){
    const encodedFunction = web3.eth.abi.encodeFunctionCall({
        name: "approve",
        type: "function",
        inputs: [
            {type: 'address',
            name: 'to'},
            {type: 'uint256',
            name: 'tokenURI'}]
    }, [nft_market_place_address, tokenId]);
    
    const transactionParameters = {
        to: hostContract,
        from: ethereum.selectedAddress,
        data: encodedFunction
    };
    const txt = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    });
    return txt
}

//Buy NFT Funtions

async function buyNFT(context){
    const offeringId = "0xe3d4b954b080af8d01815295a0c9981d27e4029028651832e446a43ac8021b07";
    let offering = window.offeringArray.find(object => object.offeringId == offeringId);
    const price = Moralis.Units.ETH(offering.price);
    const priceHexString = BigInt(price).toString(16);
    closedOffering = await closeOffering(offeringId,priceHexString);
    const tx_closeOffering = `<p> Buying transaction ${closedOffering}</p>`;
    console.log(tx_closeOffering);//context.parentElement.innerHTML = tx_closeOffering;
}

async function closeOffering(offeringId, priceEncoded){
    const encodedFunction = web3.eth.abi.encodeFunctionCall({
        name: "closeOffering",
        type: "function",
        inputs: [
            {type: 'bytes32',
            name: '_offeringId'}]
    }, [offeringId]);
    
    const transactionParameters = {
        to: nft_market_place_address,
        from: ethereum.selectedAddress,
        value: priceEncoded,
        data: encodedFunction
    };
    const txt = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    });
    return txt
}

function formatdate(timestamp){
    var today = new Date();
	var datestring = new Date(timestamp);
    var minssince = parseInt(Math.abs(today.getTime() - datestring.getTime()) / (1000 * 60) % 60);
    if (minssince < 60) { return minssince + " mn ago"; } else
    if (minssince < 1440) { return Math.ceil(minssince / 60) + " hours ago"; } else
    if (minssince < 43200) { return Math.ceil(minssince / 1440) + " days ago" } else
    if (minssince < 43200) { return Math.ceil(minssince / 43200) + " months ago" };
    return Math.ceil(minssince / 1144044) + " days ago";
}



OFFERING Moralis
async function populateOfferings(){
    let offeringArray = await getOfferings();
    let offerings = await getOfferingObjects(offeringArray);
    displayOfferings(offerings);
}

async function getOfferings(){
    const queryAll = new Moralis.Query("PlacedOfferingsTwo");
    queryAll.equalTo("tokenId", token_id_req);
    const data = await queryAll.find()
    offeringArray = [];
    console.log("Get offerings");
    
    for (let i=0; i< data.length; i++){
        let flag = await isOfferingClosed(data[i].get("offeringId"));
        if (!flag) {
            //const metadataInfo = await fetch(data[i].get("uri"));
            //const metadata = await metadataInfo.json();
            //console.log(metadata.data["name"]);
            const offering = {"offeringId":data[i].get("offeringId"),"offerer":data[i].get("offerer"),"hostContract":data[i].get("hostContract"),"tokenId":data[i].get("tokenId"),"price":web3.utils.fromWei(data[i].get("price")),"image":"","name":"","block_timestamp":data[i].get("block_timestamp")}
            offeringArray.push(offering)
        }
    }
    return offeringArray;
}

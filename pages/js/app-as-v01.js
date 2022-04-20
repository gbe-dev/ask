// Set URLS
const API_RARIBLE_SELLORDER_LIST = "https://api.rarible.org/v0.1/orders/sell/byItem?itemId=ETHEREUM:";
const API_LR_SELLORDER_LIST = "https://api.looksrare.org/api/v1/orders?status[]=VALID&";
// Using Cached - const API_LR_SELLORDER_FULLLIST = "https://api.looksrare.org/api/v1/events?type=LIST&collection=";
const API_LR_SELLORDER_FULLLIST = "https://www.afprojects.com/x-2016/nft-web-x/json/lr-full-sell-order-cached.json";
const API_RR_SELLORDER_FULLLIST = "https://api.rarible.org/v0.1/activities/byCollection?type=LIST&collection=ETHEREUM%3A";
const API_MERGED_SELLORDER_FULLLIST = "https://www.afprojects.com/x-2016/nft-web-x/json/sellorders-reservoir.json";
const API_CRYPTOCOMPARE_USD = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD";
const PLATFORM_PAGE = "https://www.afprojects.com/x-2016/nft-web-x/item.html?tokenid=";
const PLATFORM_IMAGE_REPO ="https://asrd.augustsander.org/token/";
const PLATFORM_EX_DATA = { "OpenSea" : "" } ;

async function getUSDRate() {
    $.get(API_CRYPTOCOMPARE_USD, function(data) {
        console.log("Value of ether now " + data.USD);
        NFTObject.USDrate = data.USD;
    }).catch(err => console.error("Error while loading USD Rare" + err)); 
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
function formatdatelog(timestamp){
    var today = new Date();
	var datestring = new Date(timestamp);
	if (((today - datestring) / (1000 * 3600)) < 1) {return Math.ceil((today - datestring) / (1000 * 60)) + " mn ago";} 
    else if (((today - datestring) / (1000 * 3600 * 24)) < 1) {return Math.ceil((today - datestring) / (1000 * 3600)) + " hours ago";} 
    else if (((today - datestring) / (1000 * 3600 * 24)) < 30) {return Math.ceil((today - datestring) / (1000 * 3600 * 24)) + " days ago";} 
    else {return Math.ceil((today - datestring) / (1000 * 3600 * 24) / 30) + " months ago";}
}
async function populateOfferingsMerged(contractid, tokenid){
    var fulllogdisplayp1 = "";
    var tableheader = "<table id=\"filter\" class=\"table\"><thead> <tr> <th scope=\"col\">#</th> <th scope=\"col\">Seller</th> <th scope=\"col\">Platform</th> <th scope=\"col\">Status</th> <th scope=\"col\">Price</th> <th scope=\"col\">Listed</th> <th scope=\"col\">Expiry</th> </tr> </thead> <tbody>";
    var tablefooter = "</tbody></table>";
    var fulllogdisplay = await fetch(API_MERGED_SELLORDER_FULLLIST)
		.then(res => res.json())
		.then((out) => {
                for (i = 0; i < out.length; i++){
                    fulllogdisplayp1 += generateFullOfferingsMerged(out[i]);
                }
			return fulllogdisplayp1;
		}).catch(err => console.error(err));    
    if (fulllogdisplay != "") { document.getElementById('offeringList').innerHTML = tableheader + fulllogdisplay + tablefooter; }
}
function generateFullOfferingsMerged(data) {
    var priceUsd = "";
    var today = new Date();
    if (NFTObject.USDrate && NFTObject.USDrate != 0) {
        priceUsd = ` (<i class="fa fa-usd" aria-hidden="true"></i>${parseFloat(data.price*NFTObject.USDrate).toFixed(2)})`
    }
    
	var salepricedisplay = `<img alt="ETH" src="images/eth.svg" width="10"> ${data.price}${priceUsd}`
	var statusdisplay = "Active";
    var platformlogo = `<img alt="Opensea" src="images/opensea.png" height="16">`;
    var platformname = "OpenSea";
    platformlink= "https://rarible.com/token/"+contractid+":"+data.tokenId;
    var startdate = formatdatelog(data.startdate);
    var enddate = data.enddate;

    if (data.platform == "RARIBLE") { 
        platformlogo = `<img alt="Rarible" src="images/rarible.png" height="16">`; 
        platformname = "Rarible";
        platformlink= "https://rarible.com/token/"+contractid+":"+data.tokenId;
    }
    if (data.platform == "LooksRare") { 
        platformlogo = `<img alt="LooksRare" src="images/looksrare.png" height="16">`; 
        platformname = "LooksRare"; 
        platformlink= "https://looksrare.org/collections/"+contractid+"/"+data.tokenId;
    }
    if (data.fill == "true" || data.fill == "CANCELLED") {statusdisplay = "Inactive/Processed";}   

	const TokenLogsDisplay = `<tr>
    <td><a target="_blank" href="${PLATFORM_PAGE}${data.tokenId}"><img height="120px" src="${PLATFORM_IMAGE_REPO}${data.tokenId}"></a></td>
                            <td>${data.seller.substring(11,19).toUpperCase()}</td>
                            <td><a href="${platformlink}">${platformlogo} ${platformname}</a></td>
                            <td>${statusdisplay}</td>
                            <td>${salepricedisplay} </td>
                            <td>${startdate}</td>
                            <td>${enddate}</td>
                            </tr>`
	return TokenLogsDisplay;
}

async function populateOfferings(contractid, tokenid){
    var fulllogdisplayp1 = "";
    var fulllogdisplayp2 = "";
    var tableheader = "<table id=\"filter\" class=\"table\"><thead> <tr> <th scope=\"col\">Seller</th> <th scope=\"col\">Platform</th> <th scope=\"col\">Status</th> <th scope=\"col\">Price</th> <th scope=\"col\">Listed</th> <th scope=\"col\">Expiry</th> </tr> </thead> <tbody>";
    var tablefooter = "</tbody></table>";
    console.log(API_RARIBLE_SELLORDER_LIST + contractid + ":"+ tokenid);
    var fulllogdisplay = await fetch(API_RARIBLE_SELLORDER_LIST + contractid + ":"+ tokenid)
		.then(res => res.json())
		.then((out) => {
            console.log(out);
            if (out.orders.length > 0) {
                console.log("Rarible orders");
                console.log(out.orders);
                for (i = (out.orders.length - 1); i >= 0; i--){
                    fulllogdisplayp1 += generateOfferingsRAR(out.orders[i], contractid, tokenid);
                }
            }
			return fulllogdisplayp1;
		}).catch(err => console.error(err));
        console.log(API_LR_SELLORDER_LIST + "&collection=" + contractid + "&tokenId="+ tokenid);
        fulllogdisplay += await fetch(API_LR_SELLORDER_LIST + "&collection=" + contractid + "&tokenId="+ tokenid)
		.then(res => res.json())
		.then((out) => {
            console.log("LooksRare Orders");
            console.log(out);
            if (out.data.length > 0) {
                for (i = (out.data.length - 1); i >= 0; i--){
                    fulllogdisplayp2 += generateOfferingsLR(out.data[i], contractid, tokenid);
                }
            }
			return fulllogdisplayp2;
		}).catch(err => console.error(err));
        
    if (fulllogdisplay != "") { document.getElementById('offeringList').innerHTML = tableheader + fulllogdisplay + tablefooter; }
}

function displayBuyNow() {
`<button class="accordion-button " type="button" data-bs-target="#Listings" aria-expanded="true">
<span class="buttonIocn"><i class="fab fa-ethereum" aria-hidden="true"></i></span> Sale ends <br>
XX XX XX
</button>
<div id="nft-redeem" class="accordion-collapse collapse show">
   Current Price <br>
   <img alt="ETH" src="images/eth.svg" width="10"> 1 -- Buy now at LooksRare
</div>`
}

function generateOfferingsRAR(data, contractid, tokenid) {
	var today = new Date();
    var datestring = formatdatelog(data.startedAt);
    var salepricedisplay = `<img alt="ETH" src="images/eth.svg" width="10"> ${data.makePrice} (<i class="fa fa-usd" aria-hidden="true"></i>${parseFloat(data.makePriceUsd).toFixed(2)})`
	var labeldisplay = "Transfer";
	var statusdisplay = "Active";
    var platformlogo = `<img alt="Opensea" src="images/opensea.png" height="16">`;
    var platformname = "OpenSea";
    if (data.platform == "RARIBLE") { platformlogo = `<img alt="Rarible" src="images/rarible.png" height="16">`; platformname = "Rarible"}
    if (data.fill > 0) { statusdisplay = "Executed" } else if (data.status == "CANCELLED") { statusdisplay = "Cancelled"; }
    
	const TokenLogsDisplay = `<tr>
                            <td>${data.maker.substring(11,19).toUpperCase()}</td>
                            <td><a href="https://rarible.com/token/${contractid}:${tokenid}">${platformlogo} ${platformname}</a></td>
                            <td>${statusdisplay}</td>
                            <td>${salepricedisplay} </td>
                            <td>${datestring}</td>
                            <td>${new Date(data.endedAt).toLocaleString()}</td>
                            </tr>`
	return TokenLogsDisplay;
}
function generateOfferingsLR(data, contractid, tokenid) {
    var salepricedisplay = `<img alt="ETH" src="images/eth.svg" width="10"> ${Web3.utils.fromWei(data.price, 'ether')}`
	var labeldisplay = "Transfer";
	var statusdisplay = "Active";
    var platformlogo = `<img alt="Looksrare" src="images/looksrare.png" height="16">`;

    var today = new Date();
    var startdate = formatdatelog(data.startTime * 1000);
    var enddate = new Date(data.endTime * 1000).toLocaleString();

	const TokenLogsDisplay = `<tr>
                            <td>${data.signer.substring(2,10).toUpperCase()}</td>
                            <td><a href="https://looksrare.org/collections/${contractid}/${tokenid}">${platformlogo} LooksRare</a></td>
                            <td>Active</td>
                            <td>${salepricedisplay} </td>
                            <td>${startdate}</td>
                            <td>${enddate}</td>
                            </tr>`
	return TokenLogsDisplay;
}
function generateTokenLogsDisplay(from, to, saleprice, transactiondate) {
	var salepricedisplay = "";
	var salepricedefault = "<img alt=\"ETH\" src=\"images/eth.svg\" width=\"10\"> " + saleprice / 1000000000000000000;
	var labeldisplay = "Transfer";
	var tagdisplay = "fa-exchange";
    
    var today = new Date();
    var datestring = new Date(transactiondate);
	
	if (Math.ceil((today - transactiondatedisplay) / (1000 * 3600 * 24)) < 30) {
		var transactiondatedisplay = Math.ceil((today - datestring) / (1000 * 3600 * 24)) + " days ago";
	} else {
		var transactiondatedisplay = Math.ceil((today - datestring) / (1000 * 3600 * 24) / 30) + " months ago";
	}
   
   if (from == "0x0000000000000000000000000000000000000000") {
		tagdisplay = "fa-tag";
		labeldisplay = "Minted";
    }
    if (from != "0x0000000000000000000000000000000000000000" && saleprice != 0) {
		salepricedisplay = salepricedefault;
		tagdisplay = "fa-exchange";
		labeldisplay = "Sale";
	}

	const TokenLogsDisplay = `<tr><td><i class="fa ${tagdisplay}" aria-hidden="true"></i> ${labeldisplay}</td>
                            <td><span>${salepricedisplay}</span></td>
                            <td><a href="#"><span>${from.substring(2,8).toUpperCase()}</span></a></td>
                            <td><a href="#"><span>${to.substring(2,8).toUpperCase()}</span></a></td>
                            <td>${transactiondatedisplay}</td></tr>`
	return TokenLogsDisplay;
}
function getTokenLogs(array) {
	let TokenLogs = [];
	for (i = 0; i < array.length; i++) {
		TokenLogs.push(generateTokenLogsDisplay(array[i].from_address, array[i].to_address, array[i].value, array[i].block_timestamp))
	}
	return TokenLogs;
}
function displayTokenLogs(data) {
	var fulllogdisplay = "";
	if (data.length > 0) {
		fulllogdisplay = "<table id=\"filter\" class=\"table\"><thead> <tr> <th scope=\"col\">Event</th> <th scope=\"col\">Price</th> <th scope=\"col\">From</th> <th scope=\"col\">To</th> <th scope=\"col\">Date</th> </tr> </thead> <tbody>";
		for (i = 0; i < data.length; i++) {
			fulllogdisplay += data[i];
		}
		fulllogdisplay += "</tbody></table>";
		document.getElementById('logs').innerHTML = fulllogdisplay;
	}
}
function generateTraitsDisplay(trait_type, value, frequency) {
	const TraitsDisplay = `<li class="ais-HierarchicalMenu-item"> 
                            <div class="listBox"> <a href="https://www.afprojects.com/x-2016/nft-web-x/index-as10k.html?askv2%5BrefinementList%5D%5Bsearch.${trait_type}%5D%5B0%5D=${value}">
                            <p>${trait_type}</p>
                            <p class="aisItemTitle">${value}</p>
                            <p class="subTitle">${frequency}% have this trait</p>
                            </a>
                            </div> 
                            </li>`
	return TraitsDisplay;
}
function getTraitsDisplay(array) {
	let Traits = [];
	for (i = 0; i < array.length; i++) {
		Traits.push(generateTraitsDisplay(array[i].trait_type, array[i].value, array[i].frequency))
	}
	return Traits;
}
function displayTokenData(TokenMetadata) {
	document.getElementById("nft-owner").innerHTML = TokenMetadata.owner_of.substring(2, 8).toUpperCase();
	document.getElementById("nft-tokenid").innerHTML = TokenMetadata.token_id;
	document.getElementById("nft-tokenid").href = "https://etherscan.io/nft/" + TokenMetadata.token_address + "/" + TokenMetadata.token_id;
	document.getElementById("nft-contract").innerHTML = TokenMetadata.token_address;
	document.getElementById("nft-contract").href = "https://etherscan.io/address/" + TokenMetadata.token_address;
}
function displayMetadata(tokenid, userID) {
	fetch('https://asf.clktn.com/api/v3/collekton/meta?nft_token=' + tokenid)
		.then(res => res.json())
		.then((out) => {
			document.getElementById("nft-image").src = out.data.image_data;
            document.getElementById("nft-image-container").setAttribute("data-src", out.data.image_data);
            
			document.getElementById("nft-title").title = out.data.name;
			document.getElementById("nft-title").innerHTML = out.data.name;
			document.getElementById("nft-license").innerHTML = out.data.copyright + "<br>" + out.data.licence[0];
            let lg = lightGallery(document.getElementById('nft-image-container'), {
                speed: 500,
                licenseKey: 'ABCBDA28-A9744EC6-B498F7D2-4D79283E'
            });
			var tokenAttributes = "";
			for (var j = 0; j < out.data.attributes.length; j++) {
				tokenAttributes += generateTraitsDisplay(out.data.attributes[j].trait_type, out.data.attributes[j].value, out.data.attributes[j].frequency);
			}
			document.getElementById("nft-traits").innerHTML = tokenAttributes;
			displayRedeemStatus(out.data, userID);
			return out;
		}).catch(err => console.error(err));
}
function displayCollectionFeatures() {
	fetch('https://www.afprojects.com/x-2016/nft-web-x/json/collection-promo.json')
		.then(res => res.json())
		.then((out) => {
			var gallerydisplay = "<ol class=\"ais-Hits-list disInlineFlex\">";
			for (var j = 0; j < out.length; j++) {
				gallerydisplay = gallerydisplay + "<li class=\"ais-Hits-item w30\"> <div> <div class=\"imgarea\"> <a href=\"https://www.afprojects.com/x-2016/nft-web-x/index-as10k.html?ask10%5Bquery%5D=" + encodeURIComponent(out[j].data.name) + "\"><img src=\"" + out[j].data.image_data + "\" align=\"left\" alt=\"" + out[j].data.name + "\"> </div> <div class=\"hit-name\"> " + out[j].data.name + "</div></a></li>";
			}
			gallerydisplay = gallerydisplay + "</ol>";
			document.getElementById("nft-gallery-display").innerHTML = gallerydisplay;
		}).catch(err => console.error(err));
}
function displayPrintsLogs() {
	fetch('https://api.the-art-register.com/api/tars/available_artwork?tar_id=73b26a86-6020-4ef2-9177-690f40375eec')
		.then(res => res.json())
		.then((out) => {
			var attributes_prints = "<ul id=\"compositions-list\" class=\"pure-tree main-tree\" style=\"list-style: none;\"> <li> <input type=\"checkbox\" id=\"trigger-layout\" style=\"display:none;\" checked=\"checked\"> <label for=\"trigger-layout\" id=\"nft-print-label\"> Prints for NFT XX (" + out.data.Artwork.length + ")</label> <ul class=\"pure-tree\">";
			for (var j = 0; j < out.data.Artwork.length; j++) {
				attributes_prints = attributes_prints + "<li> <input type=\"checkbox\" id=\"trigger-" + j + "\"> <label for=\"trigger-" + j + "\"> by " + out.data.Artwork[j].Eav[0].field_value + "</label> <ul class=\"pure-tree\"> <li class=\"pure-tree_link\"><a href=\"\" title=\"index.jade\" target=\"_blank\">Printed 1934, Sold 1956, Currently at the MoMA</a></li> </ul> </li>"
			}
			attributes_prints = attributes_prints + "</li></ul>";
			document.getElementById("nft-prints").innerHTML = attributes_prints;

		}).catch(err => console.error(err));
}
function verifyOwnership(tokenID, userID){

}
async function displayRedeemStatus(tokenMetadata, userID) {
    if (Moralis.User.current() != null && userID != null){
        const userEthNFTs = await Moralis.Web3API.account.getNFTs({
            chain: "eth",
            address: Moralis.User.current().get('ethAddress'),
          });
        const userEthNFTsFiltered = userEthNFTs.result.filter(function(item){
            return (item.token_address == "0x7037843d739d846cdce3a6839a80f7d70b60b99a" && item.token_id == token_id_req);
        });
        if (userEthNFTsFiltered.length > 0){ 
            if(tokenMetadata.redeemed.value == false){ document.getElementById("nft-redeem").innerHTML = "You currently own this NFT - You will soon be able to redeem your contact sheet."; }
            else { document.getElementById("nft-redeem").innerHTML = "You currently own this NFT and have redeemed it"; }
        }
    }
    else
    {
        if(tokenMetadata.redeemed.value == "true") 
        { document.getElementById("nft-redeem").innerHTML = "This NFT has been redeemed by: " + tkmetadata.data.redeemed.wallet_address.substring(2,8).toUpperCase();}

    }
} 
async function walletlogin(){
    if (Moralis.User.current() != null) { console.log("Already logged in ("+Moralis.User.current().get('ethAddress')+")"); return Moralis.User.current() ; }
    const loginobject = await Moralis.authenticate({
        provider: "web3Auth",
        clientId: "BB3MZ79TES_3qw1Jx8YFm1rjfIyqhma9O8npp-ADh3Lu6wH0hUbT_wbehFKyxbVLlxZcFqRW8WgtQUpXeJJu9nY",
        appLogo: "https://www.afprojects.com/x-2016/nft-web-x/images/logo.png"
        })
    console.log("Attempted to loggin, result:"); 
    console.log(loginobject);
    if (loginobject != null) { return Moralis.User.current(); }
    return null;
}

// Deprecated 
async function populateFullOfferingsRAR(contractid){
    var fulllogdisplay = "";
    var fulllogdisplayp1 = "";
    var fulllogdisplayp2 = "";
    var tableheader = "<table id=\"table-listing\" class=\"table\"><thead> <tr> <th scope=\"col\">#</th><th scope=\"col\" class=\"filter\">Seller</th> <th scope=\"col\" class=\"filter\">Platform</th> <th scope=\"col\">Status</th> <th scope=\"col\">Price</th> <th scope=\"col\">Listed</th> <th scope=\"col\">Expiry</th> </tr> </thead> <tbody>";
    var tablefooter = "</tbody></table>";
    
    fulllogdisplay = await fetch(API_RR_SELLORDER_FULLLIST + contractid)
		.then(res => res.json())
		.then((out) => {
            console.log("Rarible orders");
            console.log(out);
                for (i = 0; i < out.activities.length; i++){
                    fulllogdisplayp1 += generateFullOfferingsRAR(out.activities[i], contractid);
                }
			return fulllogdisplayp1;
		}).catch(err => console.error(err));
        fulllogdisplay += await fetch(API_LR_SELLORDER_FULLLIST)
		.then(res => res.json())
		.then((out) => {
            console.log("LooksRare Orders");
            console.log(out);
                for (i = 0; i < out.data.length ; i++){
                    fulllogdisplayp2 += generateFullOfferingsLR(out.data[i], contractid);
                }
			return fulllogdisplayp2;
		}).catch(err => console.error(err));
        
    if (fulllogdisplay != "") { document.getElementById('offeringList').innerHTML = tableheader + fulllogdisplay + tablefooter; }
}
function generateFullOfferingsRAR(data, contractid) {
    console.log(parseFloat(data.priceUsd).toFixed(2));
    console.log(data.priceUsd);
    console.log(data);
    var priceUsd = "";
    if (data.priceUsd) {
        priceUsd = ` (<i class="fa fa-usd" aria-hidden="true"></i>${parseFloat(data.priceUsd).toFixed(2)})`
    }
	var salepricedisplay = `<img alt="ETH" src="images/eth.svg" width="10"> ${data.price}${priceUsd}`
	var labeldisplay = "Transfer";
	var statusdisplay = "Active";
    var platformlogo = `<img alt="Opensea" src="images/opensea.png" height="16">`;
    var platformname = "OpenSea";
    if (data.platform == "RARIBLE") { platformlogo = `<img alt="Rarible" src="images/rarible.png" height="16">`; platformname = "Rarible"}

    var today = new Date();
    var datestring = new Date(data.date);
	
	if (Math.ceil((today - datestring) / (1000 * 3600 * 24)) < 30) {var startdate = Math.ceil((today - datestring) / (1000 * 3600 * 24)) + " day(s) ago";} 
    else {var startdate = Math.ceil((today - datestring) / (1000 * 3600 * 24) / 30) + " months ago";}
    if (data.reverted != false) {statusdisplay = "Cancelled";}    

	const TokenLogsDisplay = `<tr>
    <td><a href="https://www.afprojects.com/x-2016/nft-web-x/item.html?tokenid=${data.make.type.tokenId}"><img height="120px" src="https://asrd.augustsander.org/token/${data.make.type.tokenId}"></a></td>
                            <td>${data.maker.substring(11,19).toUpperCase()}</td>
                            <td><a href="https://rarible.com/token/${contractid}:${data.make.type.tokenId}">${platformlogo} ${platformname}</a></td>
                            <td>${statusdisplay}</td>
                            <td>${salepricedisplay} </td>
                            <td>${startdate}</td>
                            <td></td>
                            </tr>`
	return TokenLogsDisplay;
}
function generateFullOfferingsLR(data, contractid) {
    console.log(data);
	var salepricedisplay = `<img alt="ETH" src="images/eth.svg" width="10"> ${Web3.utils.fromWei(data.order.price, 'ether')}`
	var labeldisplay = "Transfer";
	var statusdisplay = "Active";
    var platformlogo = `<img alt="Looksrare" src="images/looksrare.png" height="16">`;

    var today = new Date();
    var startdate = new Date(data.order.startTime * 1000);
    var enddate = new Date(data.order.endTime * 1000).toLocaleString();
    
	if ((today - startdate) / (1000 * 3600 * 24) < 30) {
		var transactiondatedisplay = Math.ceil((today - startdate) / (1000 * 3600 * 24)) + " day(s) ago";
	} else {
		var transactiondatedisplay = Math.ceil((today - startdate) / (1000 * 3600 * 24) / 30) + " months ago";
	}

	const TokenLogsDisplay = `<tr>
                            <td><a href="https://www.afprojects.com/x-2016/nft-web-x/item.html?tokenid=${data.order.tokenId}"><img height="120px" src="https://asrd.augustsander.org/token/${data.order.tokenId}"></a></td>
                            <td>${data.order.signer.substring(2,10).toUpperCase()}</td>
                            <td><a href="https://looksrare.org/collections/${contractid}/${data.order.tokenId}">${platformlogo} LooksRare</a></td>
                            <td>Active</td>
                            <td>${salepricedisplay} </td>
                            <td>${transactiondatedisplay}</td>
                            <td>${enddate}</td>
                            </tr>`
	return TokenLogsDisplay;
}
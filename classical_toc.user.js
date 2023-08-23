// ==UserScript==
// @name          	Wikipedia ClassicalTOC
// @description     Restore classic TOC from Wikipedia Vector skin pre 2023
// @icon            https://raw.github.com/sepehr/userscript-SCRIPT/master/SCRIPT.png
//
// @author			Phlsph7
// @namespace       https://en.wikipedia.org/wiki/User:Phlsph7/ClassicalTOC(Vector2022)
// @downloadURL		https://en.wikipedia.org/wiki/User:Phlsph7/ClassicalTOC(Vector2022).js
//
// @license         GPLv3 - http://www.gnu.org/licenses/gpl-3.0.txt
//
// @include         http://*.wikipedia.org/*
// @match			http://*.wikipedia.org/*
//
// @require         http://code.jquery.com/jquery-1.8.0.min.js
//
// @version         1.0
// @updateURL		https://en.wikipedia.org/wiki/User:Phlsph7/ClassicalTOC(Vector2022).js
//
// @run-at			document-end
// @resource		resourceName	http://www.example.com/example.png
// @unwrap
// ==/UserScript==

/* Classical table of contents for Vector 2022 */

// utility function to get the URL of the current page and apply the parameter for the legacy vector skin
function getURL(){
	let url = window.location.href.split('#')[0] + "?useskin=vector";
	if(window.location.href.split('#').length > 1){
		url += "#" + window.location.href.split('#').slice(1).join("#");
	}
	
	return url;
}

// uses the html text of the page with the legacy vector skin as input, extracts the TOC, and places it into the current page
function getTOCfromHTML(html){
	// adjust the style of the extracted TOC
	function adjustStyle(){
		// remove bullet points and fix margin for unordered lists
		let ulElements = toc.getElementsByTagName('ul');
		for(let ulElement of ulElements){
			ulElement.style.listStyle = "none";
			ulElement.style.marginTop = "0em";
		}

		// fix left margin for the main unordered list
		let masterUl = toc.getElementsByTagName('ul')[0];
		masterUl.style.marginLeft = "0.5em";
		masterUl.style.fontSize = "95%";

		// adjust font-size and font-family for the TOC heading ("Contents")
		let tocHeading = document.getElementById('mw-toc-heading');
		tocHeading.style.fontWeight = 'bold';

		// button used to fold and unfold the TOC
		let foldButton = document.createElement('a');
		
		// button style
		foldButton.style.fontSize = '80%';
		foldButton.style.marginLeft = '0.5em';
		foldButton.style.fontFamily = 'sans-serif';
		foldButton.style.fontWeight = 'normal';
		foldButton.style.verticalAlign = 'text-bottom';
		tocHeading.appendChild(foldButton);
		foldButton.innerHTML = '<span style="color: #202122">[</span>hide<span style="color: #202122">]</span>';
		
		// when clicked: fold/unfold the TOC and change the button text
		foldButton.onclick = function(event){
			if(foldButton.innerText.includes('hide')){
				foldButton.innerHTML = foldButton.innerHTML.split('hide').join('show');
				masterUl.style.display = 'none';
			}
			else{
				foldButton.innerHTML = foldButton.innerHTML.split('show').join('hide');
				masterUl.style.display = '';
			}
		};

		// adjust colors and spaces per entry
		const styleSheet = document.createElement('style');
		styleSheet.innerHTML = `
		.tocnumber{
			color: #202122;
			padding-right: 0.2em;
		}
		
		.toctext{
			color: #0645ad;
		}
		`;
		document.head.append(styleSheet);
	}
	
	// change the look into a grey box
	function setClassicalBoxLook(){
		toc.style.border = "1px solid #a2a9b1";
		toc.style.backgroundColor = "#f8f9fa";
		toc.style.display = "inline-block";
		toc.style.paddingRight = "0.5em";
		let tocHeading = document.getElementById('mw-toc-heading');
		tocHeading.style.textAlign = "center";
		tocHeading.style.borderBottom = "none";
		tocHeading.style.marginTop = "0.3em";
		tocHeading.style.marginLeft = "0.3em";
		firstSectionHeadline.style.clear = "left";
	}
	
	// fix for pages that use the template "clear" before the first section
	function fixClearTemplate(){
		let neighbor =  toc.previousElementSibling;
		if(neighbor != null && neighbor.style.clear === 'both' && neighbor.innerText == ''){
			neighbor.parentNode.insertBefore(toc, neighbor);
		}
	}
	
	// scroll to the right position for section links in case the loading takes too long
	function scrollToRightPosition(){
		if(window.location.hash){
			let hashValue = window.location.hash.substring(1);
			let selectedHeadline = document.getElementById(hashValue);
			if(selectedHeadline != null){
				selectedHeadline.scrollIntoView();
			}
		}
	}
	
	// parse the html file
	var parser = new DOMParser();
	var htmlDoc = parser.parseFromString(html, "text/html");
	
	// extract the TOC and place it before the first headline
	var toc = htmlDoc.getElementById("toc");
	var firstSectionHeadline = getFirstSectionHeadline();
	if(toc != null && firstSectionHeadline != null){
		// insert before the first section
		firstSectionHeadline.parentElement.insertBefore(toc, firstSectionHeadline);
	
		// adjust the general style
		adjustStyle();
		
		// apply the box layout
		setClassicalBoxLook();
		
		// fix for the template "clear"
		fixClearTemplate();
		
		// scroll to the right position for section links in case the loading takes too long
		scrollToRightPosition();
	}
}
	
// utility function to get the headline of the first section, the TOC should be inserted before it
function getFirstSectionHeadline(){
	var mainContainer = document.getElementById('mw-content-text');
	var firstSectionHeadline = mainContainer.getElementsByTagName('h2')[0];
	return firstSectionHeadline;
}

// main function
(function(){
	// check whether the Vector 2022 skin is used
	if (document.body.classList.contains("skin-vector-2022")){
		// does not work when editing pages, so only show the TOC when viewing pages
		if(mw.config.get("wgAction") === "view"){
			// load the legacy html to extract their TOC
			fetch(getURL())
				.then(response => response.text())
				.then(getTOCfromHTML);
		}
	}
})();


window.onload = (e) =>{document.querySelector("#searchButton").onclick = searchButtonClicked};


function searchButtonClicked(){
    let selectedGenres = [];
    const API_URL="https://api.jikan.moe/v4/anime?sfw&page=1";
    console.log("searchButtonClicked() called");
    let url= API_URL;
    
    let genreList = document.querySelectorAll(".genre");
    
    for(let genre of genreList){
        if(genre.checked){
            selectedGenres.push(genre.value);
            console.log(genre.name);
        }
    }

    let textSearch = document.querySelector("#name-search").value;
    url +=`&q=${textSearch}`;

    //let selectedWhateverIndex = [that dropdown menu's selected index]
    //let selectedWhatever = [the actual value the dropdown menu has selected]
    

    let selectedOrderIndex = document.querySelector("#order-by").options.selectedIndex;
    let selectedOrdering = document.querySelector("#order-by").options[selectedOrderIndex].value;


    let selectedAiringIndex = document.querySelector("#Airing").options.selectedIndex;
    let selectedAiring = document.querySelector("#Airing").options[selectedAiringIndex].value;

    if(selectedOrdering)
    {
        url += "&order_by=" + selectedOrdering;
    }
    if(selectedAiring){
        url += "&status=" + selectedAiring;
    }
    
    if(selectedGenres.length>0)
    {
        url += "&genres=";
        for(let i=0; i<selectedGenres.length;i++)
        {
            if(i==0)
            {
                url+=selectedGenres[i];
            }
            else
            {
                url+="," + selectedGenres[i];
            }
        }
    }
    
    console.log(url);
    getData(url);
}

function getData(url){
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}


function dataError(e){
    console.log("An error occurred");
}

function dataLoaded(e){
    let xhr = e.target;
    // console.log(xhr.responseText);

    let obj = JSON.parse(xhr.responseText);

    document.querySelector("#content").innerHTML = "";
    if(!obj.data || obj.data.length==0){
        document.querySelector("#status").innerHTML="no results returned";
        return;
    }

    let results = obj.data;
    console.log("results.length = " + results.length);
   document.querySelector("#status").innerHTML =  "Here are " + results.length + " results for selected genres";
    let bigString = "";
    for(let result of results)
    {
        let smallURL = result.images.jpg.image_url;
        if(!smallURL) smallURL = "images/no-image-fonud.png"

        let url = result.url;

        let desc = "";
        if(result.synopsis)
        {
            desc = "" + result.synopsis;
            desc = `${desc.slice(0,300)}...`;
        }
        else
        {
            desc = "not available";
        }

        let title="";
        try{
            title = "" + result.titles[0].title;
        }
        catch(e)
        {
            if(e instanceof TypeError)
            {
                console.log("hey there was a typeError here");
                continue;
            }
        }
        console.log("title= " + title);
        let line = `<div class='result'><a target='_blank' href='${url}'><img src='${smallURL}'/></a>`
        line += `<h3>${title}</h3><p>${desc}</p><span></span></div>`
        bigString += line;
    }
    document.querySelector("#content").innerHTML = bigString;

    // document.querySelector("#status").innerHTML = "success!";
}
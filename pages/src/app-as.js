/* global instantsearch algoliasearch */

const search = instantsearch({
  indexName: 'askv2',
  searchClient: algoliasearch('VE1IFHA7WJ', '823c5e882762a242ff1632b1d7350666'),
  routing: true
});

search.addWidgets([
instantsearch.widgets.searchBox({container: '#searchbox',}),
instantsearch.widgets.currentRefinements({container: '#menu-filters',}),
instantsearch.widgets.currentRefinements({
container: '#menu-filters',
  transformItems(items) {
      return items.map(item => ({
        ...item,
        label: item.label.substring(item.label.indexOf(".")+1).toUpperCase() + '',
      }));
    },
}),
instantsearch.widgets.refinementList({
  container: '#menu-museums',
  attribute: 'search.Museum',
  showMore: false,
  limit:100,
  showMoreLimit:200,
}),
instantsearch.widgets.refinementList({
  container: '#menu-books',
  attribute: 'search.Book',
  showMore: false,
  limit:100,
  showMoreLimit:200,
}),
instantsearch.widgets.refinementList({
  container: '#menu-portfolio',
  attribute: 'search.ASA Portfolio',
  limit:50,
}),
instantsearch.widgets.refinementList({
  container: '#menu-group',
  attribute: 'search.ASA Group',
  showMore: true,
  limit:20,
  showMoreLimit:200,
}),
instantsearch.widgets.refinementList({
  container: '#menu-subject',
  attribute: 'search.Subject',
  showMore: false,
  limit:40,
  showMoreLimit:200,
}),
instantsearch.widgets.refinementList({
  container: '#menu-aspectratio',
  attribute: 'search.Aspect Ratio',
  limit:15,
}),
instantsearch.widgets.refinementList({
  container: '#menu-scene',
  attribute: 'search.Scene',
  limit:50,
}),
instantsearch.widgets.refinementList({
  container: '#menu-type',
  attribute: 'search.Type',
  limit:15,
}),
instantsearch.widgets.refinementList({
  container: '#menu-conference',
  attribute: 'search.Conference',
  limit:15,
}),
instantsearch.widgets.refinementList({
  container: '#menu-animal',
  attribute: 'search.Animal',
  limit:15,
}),
instantsearch.widgets.refinementList({
  container: '#menu-background',
  attribute: 'search.Background',
  limit:15,
}),
instantsearch.widgets.refinementList({
  container: '#menu-token',
  attribute: 'token',
  showMore: false,
  limit:40,
  showMoreLimit:200,
}),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: `
        <div>
        <div class="imgarea"> 
          <a href="./item.html?tokenid={{token}}"><img src="https://asrd.augustsander.org/token/{{token}}" align="left" alt="{{name}}" /></a>
        </div>
          <div class="hit-name">
            {{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}
          </div>
        </div>
      `,
    },
  })
]);

search.addWidget(
  instantsearch.widgets.pagination({
    container: document.querySelector("#pagination")
  })
);
search.start();
document.getElementById("menu-token").style.display = 'none';
search.on('render', () => {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: 'smooth'
	  });
  });
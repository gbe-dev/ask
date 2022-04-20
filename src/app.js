/* global instantsearch algoliasearch */
const search = instantsearch({
	indexName: 'gbe',
	searchClient: algoliasearch('VE1IFHA7WJ', '823c5e882762a242ff1632b1d7350666'),
});

const createDataAttribtues = refinement =>
  Object.keys(refinement)
    .map(key => `data-${key}="${refinement[key]}"`)
    .join(' ');

const renderListItem = item => `
  ${item.refinements
    .filter(refinement => refinement.attribute != 'YearRange')
    .map(
      refinement =>
        `<li class="ais-CurrentRefinements-item">
          <span class="ais-CurrentRefinements-label">${refinement.attribute}:</span> 
          <span class="ais-CurrentRefinements-category">
          	<span class="ais-CurrentRefinements-categoryLabel">${refinement.label} (${refinement.count})</span>
          	<button ${createDataAttribtues(refinement)} class="ais-CurrentRefinements-delete">✕</button>
          </span>
        </li>`
    )
    .join('')}
`;
const renderListItemDate = item => `
  ${item.refinements
  	.filter(refinement => refinement.attribute == 'YearRange')
    .map(
      refinement =>
        `<li class="ais-CurrentRefinements-item">
          <span class="ais-CurrentRefinements-label">Year:</span> 
          <span class="ais-CurrentRefinements-category">
          	<span class="ais-CurrentRefinements-categoryLabel">${refinement.label}</span>
          	<button ${createDataAttribtues(refinement)} class="ais-CurrentRefinements-delete">✕</button>
          </span>
        </li>`
    )
    .join('')}
`;

const renderCurrentRefinements = (renderOptions, isFirstRender) => {
  const { items, refine, widgetParams } = renderOptions;

  widgetParams.container.innerHTML = `
    <div class="ais-CurrentRefinements">
    <ul class="ais-CurrentRefinements-list">
      ${items.map(renderListItemDate).join('')}
      ${items.map(renderListItem).join('')}
    </ul>
    </div>
  `;

  [...widgetParams.container.querySelectorAll('button')].forEach(element => {
    element.addEventListener('click', event => {
      const item = Object.keys(event.currentTarget.dataset).reduce(
        (acc, key) => ({
          ...acc,
          [key]: event.currentTarget.dataset[key],
        }),
        {}
      );

      refine(item);
    });
  });
};

// Create the custom widget
const customCurrentRefinements = instantsearch.connectors.connectCurrentRefinements(
  renderCurrentRefinements
);

// Instantiate the custom widget
search.addWidget(
  customCurrentRefinements({
    container: document.querySelector('#menu-filters'),
  })
);

search.addWidgets([
	instantsearch.widgets.searchBox({
		container: '#searchbox',
	}),
	instantsearch.widgets.refinementList({
		container: '#brand-list',
		limit: 200,
		showMore: false,
		attribute: 'Publication',
	}),

	instantsearch.widgets.refinementList({
		container: '#menu-technique',
		attribute: 'Technique',
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-location',
		attribute: 'Location',
		showMore: true,
		limit: 100,
		showMoreLimit: 200,
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-year',
		attribute: 'Year',
		showMore: true,
		limit: 100,
		showMoreLimit: 200,
	}),
	instantsearch.widgets.rangeInput({
  		container: '#range-year',
  		attribute: 'YearRange',
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-museums',
		attribute: 'MuseumCollections',
		limit: 15,
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-books',
		attribute: 'Books',
		limit: 15,
		scrollTo: 'header',
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-extradata',
		attribute: 'ExtraData',
		limit: 15,
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-features',
		attribute: 'Features',
		limit: 15,
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-covers',
		attribute: 'Cover',
		limit: 15,
	}),
	instantsearch.widgets.refinementList({
		container: '#menu-ai-tags',
		attribute: 'AI-Tags',
		searchable: true,
		showMore: true,
		limit: 100,
		showMoreLimit: 200,
	}),
	instantsearch.widgets.hits({
		container: '#hits',
		templates: {
			item: `
   <div class="imgarea" data-src="https://storage.googleapis.com/bucketask22/GBE/{{UID}}.jpg" data-sub-html="#caption-{{RowID}}"> 
      <img src="https://storage.googleapis.com/bucketask22/GBE/{{UID}}.jpg" align="left" alt="{{Title}}" />
   </div>
   <div class="hit-name">
      {{#helpers.highlight}}{ "attribute": "Artist" }{{/helpers.highlight}}
   </div>
   <div class="hit-description">
      {{#helpers.highlight}}{ "attribute": "Title" }{{/helpers.highlight}}<br>
      (#{{#helpers.highlight}}{ "attribute": "UID" }{{/helpers.highlight}}) <a target="_blank" href="https://docs.google.com/spreadsheets/d/11tOhGlNgsDXaXvLMrIb6omM0YsbQvE4UlPOM5idZ_GA/edit#gid=1591496485&range=A{{RowID}}">Edit</a>
   </div>
   <div id="caption-{{RowID}}" style="display:none">
   <div class="hit-name">
   {{#helpers.highlight}}{ "attribute": "Artist" }{{/helpers.highlight}}
</div>
<div class="hit-description">
   {{#helpers.highlight}}{ "attribute": "Title" }{{/helpers.highlight}}<br>Market: {{#helpers.highlight}}{ "attribute": "Market" }{{/helpers.highlight}}<br>
   (#{{#helpers.highlight}}{ "attribute": "UID" }{{/helpers.highlight}}) <a target="_blank" href="https://docs.google.com/spreadsheets/d/11tOhGlNgsDXaXvLMrIb6omM0YsbQvE4UlPOM5idZ_GA/edit#gid=1591496485&range=A{{RowID}}">Edit</a>
</div>
   </div>
`,
		},
	})
]);
let lg = lightGallery(document.getElementById('hits'), {
	selector: ".imgarea",
	speed: 500,
	plugins: [lgZoom],
	licenseKey: 'ABCBDA28-A9744EC6-B498F7D2-4D79283E'
 });
search.start();
search.on('render', () => {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: 'smooth'
	  });
	lg.refresh();
  });
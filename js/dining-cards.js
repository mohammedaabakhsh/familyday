/* Both dining views use the same source template, prices and inclusions. */
var FD_DINING_CARDS = (function(){
  'use strict';
  function create(source,size,orderable){
    var card=source.querySelector('#dining-card-template').content.querySelector('.fd-dining-card').cloneNode(true);
    card.id='dining-card-'+size;
    card.dataset.size=String(size);
    var capacity=size+' '+(size<=10 ? 'أشخاص' : 'شخصًا');
    card.querySelector('.fd-dining-capacity').textContent=capacity;
    var photo=card.querySelector('img');
    photo.src='/'+photo.getAttribute('data-page-src').replace(/^\//,'');
    photo.removeAttribute('data-page-src');
    card.querySelectorAll('.fd-dining-price-box').forEach(function(box){
      var option=box.dataset.option,price=_tawilatPrices[size][option];
      box.querySelector('.fd-dining-price').textContent=price+' ريال';
      if(orderable){
        var button=document.createElement('button');
        button.type='button';button.className='fd-dining-option';button.dataset.option=option;
        button.setAttribute('aria-pressed','false');
        button.textContent=box.querySelector('.fd-dining-option-name').textContent;
        card.querySelector('.fd-dining-options').appendChild(button);
      }
    });
    _tawilatInclusions.forEach(function(text){var li=document.createElement('li');li.textContent=text;card.querySelector('.fd-dining-inclusions').appendChild(li);});
    if(!orderable) card.querySelector('.fd-dining-order').remove();
    return card;
  }
  return {create:create};
})();

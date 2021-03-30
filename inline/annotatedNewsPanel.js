const text = document.querySelector('#annotate');
const tooltip = document.querySelector('#AnnotatedNewsContextPanel');

const popperInstance = Popper.createPopper(text, tooltip, {
  modifiers: [{
    name: "offset",
    options: {
      offset: [0, 8],
    },
  }, ],
});

function show() {
  // Make the tooltip visible
  tooltip.setAttribute('data-show', '');

  // Enable the event listeners
  popperInstance.setOptions({
    modifiers: [{
      name: 'eventListeners',
      enabled: true
    }],
  });

  // Update its position
  popperInstance.update();
}

function hide() {
  // Hide the tooltip
  tooltip.removeAttribute('data-show');

  // Disable the event listeners
  popperInstance.setOptions({
    modifiers: [{
      name: 'eventListeners',
      enabled: false
    }],
  });
}

const showEvents = ['mouseenter', 'focus'];
const hideEvents = ['mouseleave', 'blur'];

showEvents.forEach(event => {
  text.addEventListener(event, show);
});

hideEvents.forEach(event => {
  text.addEventListener(event, hide);
});

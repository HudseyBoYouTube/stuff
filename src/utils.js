export const applyCloak = (isCloaked) => {
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  if (isCloaked) {
    link.type = 'image/x-icon';
    link.href = 'https://www.google.com/favicon.ico';
    document.title = 'Google';
  } else {
    link.type = 'image/png';
    link.href = 'https://img.icons8.com/color/32/capybara.png'; 
    document.title = 'Capybara Science';
  }

  const h = document.getElementsByTagName('head')[0];
  h.removeChild(link);
  h.appendChild(link);
};

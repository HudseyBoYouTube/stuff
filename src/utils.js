export const applyCloak = (isCloaked) => {
  let link = document.querySelector("link[rel~='icon']");
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  if (isCloaked) {
    link.href = 'https://www.google.com/images/branding/product/ico/googleg_lodp.ico';
    document.title = 'Google';
  } else {
    link.href = 'https://img.icons8.com/color/32/capybara.png'; 
    document.title = 'Capybara Science';
  }
};

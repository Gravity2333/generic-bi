export const dynamicSetHeaderTitle = (title: string)=>{
    const headerTitle = document.querySelector('#logo');
    if (headerTitle) {
      headerTitle.innerHTML = `<h3 style="cursor:pointer">${title}</h3>`;
      document.title = title
    }
  }
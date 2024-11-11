import { EBACKGROUNDTYPE } from "@/pages/Dashboard/components/HorizontalBackground/typing";

export const dynamicSetHeaderTitle = (title: string)=>{
    const headerTitle = document.querySelector('#logo');
    if (headerTitle) {
      headerTitle.innerHTML = `<h3 style="cursor:pointer">${title}</h3>`;
      document.title = title
    }
  }

  const _BACKGROUND_CLASS_MAP_ ={
    [EBACKGROUNDTYPE.EMPTY]: 'empty-dashboard-background',
    [EBACKGROUNDTYPE.GRID]: 'grid-dashboard-background',
    [EBACKGROUNDTYPE.LINE]: 'line-dashboard-background',
    [EBACKGROUNDTYPE.DEFAULT_PIC]: 'default-pic-dashboard-background',
    [EBACKGROUNDTYPE.YELLOW_LEAVES]: 'global-leaves-pic-dashboard-background'
  }
  
  export function SET_DASHBOARD_BACKGOUNRD(b: EBACKGROUNDTYPE){
    const back = document.querySelector('.ant-card.ant-card-bordered.ant-card-small');
    if (back) {
      let classList = back.className.split(' ');
      classList = classList.slice(0, 3);
      classList.push(_BACKGROUND_CLASS_MAP_[b]);
      back.className = classList.join(' ');
    }
  }

  export function GET_SEL_CARD_CLASSNAME(b: EBACKGROUNDTYPE){
    return _BACKGROUND_CLASS_MAP_[b]
  }
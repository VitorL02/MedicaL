const schedules = document.querySelector('.schedule');
const form = document.querySelector('form');
const scheduleList = document.getElementById("schedule-list");


let db;
const dataBaseName = 'medicalSchedules';
const storeName ='tb_shcedules';

const createDb = ()=>{
  if(window.indexedDB){
    //Versionamento do banco 
    const request = window.indexedDB.open(dataBaseName,1);

    request.onsuccess = (event) =>{
      db = request.result;
      console.log("Sucesso",event,db);
      getSchedules();
  };

    request.onupgradeneeded = (event) =>{

      db = event.target.result;

      const objectStore = db.createObjectStore(storeName,
      {
        keyPath:'id',
        autoIncrement:true
      }  
    );
    objectStore.createIndex('title','title',{unique: false});

    }
    request.onerror = (event) =>{
      console.log(event)
    }

  }else{
    console.log("Não tem suporte para indexedDB ")
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const menus = document.querySelectorAll('.side-menu');
    M.Sidenav.init(menus, {edge: 'right'});
    //realiza o open do formulario
    const forms = document.querySelectorAll('.side-form');
    M.Sidenav.init(forms, {edge: 'left'});
    //Cria o banco assim que o dom e carregado
    createDb();
  });



  form.addEventListener('submit',event =>{
    event.preventDefault();

    const medicalSchedule = {
      name:form.name.value,
      adress: form.adress.value,
      query: form.query.value,
    }

    let transaction = db.transaction([storeName], 'readwrite');
    let objectStore = transaction.objectStore(storeName);
    let request = objectStore.add(medicalSchedule);

    request.onsuccess = () => {
      form.query.value ="";
      form.adress.value = ""
      form.name.value ="";
    };

    transaction.oncomplete = (event)=>{
      console.log('agendamento feito com sucesso',event);
      getSchedules();
    }
    
    transaction.onerror = (event)=>{
      console.log('erro',event)
    }


  });



const getSchedules = () =>{
  cleanList();
  let objectStore = db.transaction(storeName).objectStore(storeName);

  objectStore.openCursor().onsuccess = (event) =>{
    const cursor = event.target.result;

    if(cursor){
      renderSchedule(cursor.value.query,cursor.value.name,cursor.value.adress,cursor.value.id);

      const deleteButton = document.querySelectorAll('.delete-button');
      for(let i = 0 ; i < deleteButton.length; i++){
        deleteButton[i].addEventListener('click',deleteMedicalSchedule );
      }

      cursor.continue();
    }
  }
}



const cleanList = () => {
  scheduleList.innerHTML = '';
}



  const renderSchedule = (time,adress,name,id) => {
      const html = `
      <div class="card-panel schedule white row" >
        <img src="assets/stethoscope.png" class="thumb" alt="thumb">
        <div class="schedule-details">
          <div class="schedule-title">Data do Agendamento: ${new Date(time).toLocaleDateString('pt-br') + " "+ new Date(time).toLocaleTimeString('pt-br')}</div>
          <div class="schedule-ingredients">Endereço: ${adress}</div>
          <div class="schedule-time">Nome da Clinica: ${name}</div>
        </div>
        <div class="schedule-delete">
          <i class="material-icons delete-button" schedule-id=${id}>delete_outline</i>
        </div>
        </div>`;

        schedules.innerHTML += html;
  }


  const deleteMedicalSchedule = (eventClick)=>{

    const scheduleId =  parseInt(eventClick.target.getAttribute('schedule-id'), 10);
    console.log(scheduleId)
  
    const deleteTransaction = db.transaction([storeName],'readwrite');
    const objectStore = deleteTransaction.objectStore(storeName);
    const request = objectStore.delete(scheduleId);
  
    request.onsuccess = (event) => {
      console.log('request success ', event);
    }
  
    deleteTransaction.oncomplete = (event)=>{
      console.log(`deletado com sucesso id ${scheduleId}`,event);
      getSchedules();
    }

    deleteTransaction.onerror = (event) => {
      console.log('delete transaction error', event);
    }



}
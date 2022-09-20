if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then((reg)=>console.log('Serviço registrado com sucesso',reg)).catch((err)=>console.log("Erro inesperado",err));

}
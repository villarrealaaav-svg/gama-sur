/* gamasur-img.js — subida de imágenes a Supabase Storage.
   REUSABLE en TODAS las apps del launcher GamaSur.
   Uso:
     <script src="gamasur-img.js"></script>
     gsUploadImage(file, {folder:'radar'}).then(function(url){ ... }).catch(function(err){ ... });
   Devuelve una URL pública ligera (no base64) → sincroniza bien por Firebase y se ve en todos los dispositivos.
   La key es "publishable" (segura para el navegador por diseño). */
(function(){
  var SUPA={
    url:'https://evfxsmzsojlckynncths.supabase.co',
    key:'sb_publishable_ivfh1musnspnJ4yHohzPQQ_TeMeT5iI',
    bucket:'obras'
  };
  window.GS_SUPA=SUPA;
  /* gsUploadImage(file, opts) → Promise<urlPublica>
     opts: { folder:'radar', max:1000 (px lado mayor), q:0.72 (calidad jpeg) } */
  window.gsUploadImage=function(file,opts){
    opts=opts||{};
    var max=opts.max||1000, q=opts.q||0.72, folder=opts.folder||'img';
    return new Promise(function(resolve,reject){
      if(!file){reject('sin archivo');return;}
      var rd=new FileReader();
      rd.onerror=function(){reject('no se pudo leer el archivo');};
      rd.onload=function(){
        var im=new Image();
        im.onerror=function(){reject('imagen inválida');};
        im.onload=function(){
          var w=im.width,h=im.height;
          if(w>max){h=Math.round(h*max/w);w=max;}
          var cv=document.createElement('canvas');cv.width=w;cv.height=h;
          cv.getContext('2d').drawImage(im,0,0,w,h);
          cv.toBlob(function(blob){
            if(!blob){reject('no se pudo comprimir');return;}
            var path=folder+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+'.jpg';
            fetch(SUPA.url+'/storage/v1/object/'+SUPA.bucket+'/'+path,{
              method:'POST',
              headers:{apikey:SUPA.key,Authorization:'Bearer '+SUPA.key,'x-upsert':'true','Content-Type':'image/jpeg'},
              body:blob
            }).then(function(r){
              if(r.ok){resolve(SUPA.url+'/storage/v1/object/public/'+SUPA.bucket+'/'+path);}
              else{r.text().then(function(t){reject('subida '+r.status+': '+t);});}
            }).catch(function(e){reject('red: '+String(e));});
          },'image/jpeg',q);
        };
        im.src=rd.result;
      };
      rd.readAsDataURL(file);
    });
  };
  /* gsUploadDataUrl(dataUrl, opts) → Promise<urlPublica>. Sube una imagen base64 ya existente (migración). */
  window.gsUploadDataUrl=function(dataUrl,opts){
    opts=opts||{}; var folder=opts.folder||'img';
    return new Promise(function(resolve,reject){
      if(!dataUrl||dataUrl.indexOf('data:')!==0){reject('no es dataURL');return;}
      fetch(dataUrl).then(function(r){return r.blob();}).then(function(blob){
        var ext=(blob.type&&blob.type.indexOf('png')>=0)?'png':'jpg';
        var path=folder+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+'.'+ext;
        return fetch(SUPA.url+'/storage/v1/object/'+SUPA.bucket+'/'+path,{
          method:'POST',
          headers:{apikey:SUPA.key,Authorization:'Bearer '+SUPA.key,'x-upsert':'true','Content-Type':blob.type||'image/jpeg'},
          body:blob
        }).then(function(rr){
          if(rr.ok){resolve(SUPA.url+'/storage/v1/object/public/'+SUPA.bucket+'/'+path);}
          else{rr.text().then(function(t){reject('subida '+rr.status+': '+t);});}
        });
      }).catch(function(e){reject('red: '+String(e));});
    });
  };
})();

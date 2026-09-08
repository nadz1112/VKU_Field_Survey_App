(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();let S=null;const O=new Set;function Ie(e){return O.add(e),S&&e(S),()=>O.delete(e)}async function Ae(){if(!S)return!1;S.prompt();const{outcome:e}=await S.userChoice;return console.log("[PWA] Kết quả người dùng chọn:",e),S=null,O.forEach(t=>t(null)),e==="accepted"}function Ee(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),S=e,console.log("[PWA] Sự kiện beforeinstallprompt đã sẵn sàng"),O.forEach(t=>t(S))}),window.addEventListener("appinstalled",()=>{console.log("[PWA] Ứng dụng VKU Field Survey đã được cài đặt thành công!"),S=null,O.forEach(e=>e(null))}),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").then(e=>{console.log("[Service Worker] Đăng ký thành công với scope:",e.scope),e.onupdatefound=()=>{const t=e.installing;t&&(t.onstatechange=()=>{t.state==="installed"&&navigator.serviceWorker.controller&&(console.log("[Service Worker] Có bản cập nhật mới sẵn sàng."),window.dispatchEvent(new CustomEvent("vku-sw-update-available")))})}}).catch(e=>{console.error("[Service Worker] Đăng ký thất bại:",e)})})}const X=(e,t)=>t.some(n=>e instanceof n);let ce,le;function Ne(){return ce||(ce=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function $e(){return le||(le=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const J=new WeakMap,G=new WeakMap,H=new WeakMap;function Oe(e){const t=new Promise((n,a)=>{const i=()=>{e.removeEventListener("success",s),e.removeEventListener("error",r)},s=()=>{n(B(e.result)),i()},r=()=>{a(e.error),i()};e.addEventListener("success",s),e.addEventListener("error",r)});return H.set(t,e),t}function Ke(e){if(J.has(e))return;const t=new Promise((n,a)=>{const i=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",r),e.removeEventListener("abort",r)},s=()=>{n(),i()},r=()=>{a(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",s),e.addEventListener("error",r),e.addEventListener("abort",r)});J.set(e,t)}let Y={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return J.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return B(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function we(e){Y=e(Y)}function Pe(e){return $e().includes(e)?function(...t){return e.apply(Z(this),t),B(this.request)}:function(...t){return B(e.apply(Z(this),t))}}function De(e){return typeof e=="function"?Pe(e):(e instanceof IDBTransaction&&Ke(e),X(e,Ne())?new Proxy(e,Y):e)}function B(e){if(e instanceof IDBRequest)return Oe(e);if(G.has(e))return G.get(e);const t=De(e);return t!==e&&(G.set(e,t),H.set(t,e)),t}const Z=e=>H.get(e);function qe(e,t,{blocked:n,upgrade:a,blocking:i,terminated:s}={}){const r=indexedDB.open(e,t),c=B(r);return a&&r.addEventListener("upgradeneeded",o=>{a(B(r.result),o.oldVersion,o.newVersion,B(r.transaction),o)}),n&&r.addEventListener("blocked",o=>n(o.oldVersion,o.newVersion,o)),c.then(o=>{s&&o.addEventListener("close",()=>s()),i&&o.addEventListener("versionchange",l=>i(l.oldVersion,l.newVersion,l))}).catch(()=>{}),c}const Me=["get","getKey","getAll","getAllKeys","count"],He=["put","add","delete","clear"],R=new Map;function de(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(R.get(t))return R.get(t);const n=t.replace(/FromIndex$/,""),a=t!==n,i=He.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(i||Me.includes(n)))return;const s=async function(r,...c){const o=this.transaction(r,i?"readwrite":"readonly");let l=o.store;return a&&(l=l.index(c.shift())),(await Promise.all([l[n](...c),i&&o.done]))[0]};return R.set(t,s),s}we(e=>({...e,get:(t,n,a)=>de(t,n)||e.get(t,n,a),has:(t,n)=>!!de(t,n)||e.has(t,n)}));const _e=["continue","continuePrimaryKey","advance"],ue={},ee=new WeakMap,xe=new WeakMap,Ve={get(e,t){if(!_e.includes(t))return e[t];let n=ue[t];return n||(n=ue[t]=function(...a){ee.set(this,xe.get(this)[t](...a))}),n}};async function*Ue(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,Ve);for(xe.set(n,t),H.set(n,Z(t));t;)yield n,t=await(ee.get(n)||t.continue()),ee.delete(n)}function ge(e,t){return t===Symbol.asyncIterator&&X(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&X(e,[IDBIndex,IDBObjectStore])}we(e=>({...e,get(t,n,a){return ge(t,n)?Ue:e.get(t,n,a)},has(t,n){return ge(t,n)||e.has(t,n)}}));const Ge="VKU_Field_Survey_DB",Re=1;let W=null;function w(){return W||(W=qe(Ge,Re,{upgrade(e,t,n,a){if(!e.objectStoreNames.contains("surveys")){const i=e.createObjectStore("surveys",{keyPath:"id"});i.createIndex("createdAt","createdAt"),i.createIndex("syncStatus","syncStatus"),i.createIndex("building","building")}e.objectStoreNames.contains("sync_queue")||e.createObjectStore("sync_queue",{keyPath:"id"}).createIndex("queuedAt","queuedAt"),e.objectStoreNames.contains("settings")||e.createObjectStore("settings")}})),W}async function P(e){const t=await w(),n={...e,updatedAt:new Date().toISOString()};return await t.put("surveys",n),n}async function We(e){return(await w()).get("surveys",e)}async function _(){return(await(await w()).getAll("surveys")).sort((n,a)=>new Date(a.createdAt)-new Date(n.createdAt))}async function Le(e){await(await w()).delete("surveys",e),await Ce(e)}async function Fe(e){const t=await w(),n={id:e.id,type:"CREATE_SURVEY",payload:e,queuedAt:new Date().toISOString(),retryCount:0};return await t.put("sync_queue",n),n}async function D(){return(await w()).getAll("sync_queue")}async function Ce(e){await(await w()).delete("sync_queue",e)}async function ze(e,t=null){const a=await(await w()).get("settings",e);return a!==void 0?a:t}async function he(e,t){return await(await w()).put("settings",t,e),t}async function Te(){const e=await _(),t=await D(),n=e.filter(r=>r.syncStatus==="pending").length,a=e.filter(r=>r.syncStatus==="synced").length,i=e.filter(r=>r.syncStatus==="draft").length;let s={quota:0,usage:0};if(navigator.storage&&navigator.storage.estimate)try{s=await navigator.storage.estimate()}catch(r){console.warn("Không thể lấy storage estimate:",r)}return{totalSurveys:e.length,pendingCount:n,syncedCount:a,draftCount:i,queueCount:t.length,storageUsageBytes:s.usage||0,storageQuotaBytes:s.quota||0,storageUsageMB:((s.usage||0)/(1024*1024)).toFixed(2)}}let F=!1;const te=new Set;function je(e){return te.add(e),()=>te.delete(e)}function A(e){for(const t of te)try{t(e)}catch(n){console.error("Lỗi listener sync:",n)}}function y(){return typeof navigator<"u"&&navigator.onLine}async function Qe(){if("serviceWorker"in navigator&&"SyncManager"in window)try{return await(await navigator.serviceWorker.ready).sync.register("sync-surveys"),console.log("[Sync Service] Đã kích hoạt Background Sync: sync-surveys"),!0}catch(e){return console.warn("[Sync Service] Background Sync không được cấp phép hoặc gặp lỗi:",e),!1}return!1}async function Xe(e){if(await new Promise(i=>setTimeout(i,600)),!y())throw new Error("Mất kết nối mạng trong quá trình gửi.");const t=JSON.parse(localStorage.getItem("vku_server_synced_records")||"[]"),n=t.findIndex(i=>i.id===e.id),a={...e,serverReceivedAt:new Date().toISOString(),status:"CONFIRMED"};return n>=0?t[n]=a:t.push(a),localStorage.setItem("vku_server_synced_records",JSON.stringify(t)),{success:!0,surveyId:e.id,syncedAt:new Date().toISOString()}}async function q(){if(F)return console.log("[Sync Service] Quá trình đồng bộ đang chạy dở..."),{success:!1,message:"Đang trong quá trình đồng bộ."};if(!y())return console.log("[Sync Service] Thiết bị đang Offline, không thể đồng bộ ngay bây giờ."),A({isSyncing:!1,isOnline:!1,queueLength:(await D()).length}),{success:!1,message:"Thiết bị đang Offline."};const e=await D();if(e.length===0)return A({isSyncing:!1,isOnline:!0,queueLength:0}),{success:!0,syncedCount:0};F=!0,A({isSyncing:!0,isOnline:!0,queueLength:e.length});let t=0,n=0;for(const i of e)try{const s=await Xe(i.payload),r=await We(i.id);r&&(r.syncStatus="synced",r.syncedAt=s.syncedAt,await P(r)),await Ce(i.id),t++}catch(s){if(console.error(`[Sync Service] Đồng bộ phiếu ${i.id} thất bại:`,s),n++,!y())break}F=!1;const a=await D();return A({isSyncing:!1,isOnline:y(),queueLength:a.length,lastSyncAt:new Date().toISOString()}),{success:n===0,syncedCount:t,failedCount:n,remainingCount:a.length}}function Je(){window.addEventListener("online",()=>{console.log("[Sync Service] Thiết bị đã kết nối mạng trở lại (Online)!"),A({isOnline:!0}),setTimeout(()=>{q()},1e3)}),window.addEventListener("offline",()=>{console.log("[Sync Service] Thiết bị mất kết nối mạng (Offline). Chuyển sang Offline-First!"),A({isOnline:!1})}),"serviceWorker"in navigator&&navigator.serviceWorker.addEventListener("message",e=>{e.data&&e.data.type==="TRIGGER_BACKGROUND_SYNC"&&(console.log("[Sync Service] Nhận tín hiệu TRIGGER_BACKGROUND_SYNC từ Service Worker"),q())}),y()&&setTimeout(()=>{q()},1500)}async function Ye(){const e=await _(),t="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(e,null,2)),n=document.createElement("a");n.setAttribute("href",t),n.setAttribute("download",`VKU_Survey_Export_${new Date().toISOString().slice(0,10)}.json`),document.body.appendChild(n),n.click(),n.remove()}const pe=[{id:"KHU_V",name:"Khu V - Tòa nhà Điều hành & Giảng đường trung tâm"},{id:"KHU_A",name:"Khu A - Khu Giảng đường Lý thuyết"},{id:"KHU_B",name:"Khu B - Tòa nhà Công nghệ & Phòng Lab thực hành"},{id:"KHU_C",name:"Khu C - Khu Giảng đường & Hội trường lớn"},{id:"KHU_K",name:"Khu K - Ký túc xá sinh viên VKU"},{id:"THU_VIEN",name:"Thư viện số & Trung tâm Đổi mới sáng tạo (MakerSpace)"},{id:"THE_THAO",name:"Khu phức hợp Thể thao & Sân bóng"},{id:"CAN_TIN",name:"Nhà ăn Sinh viên & Căn tin dịch vụ"},{id:"BAI_XE",name:"Bãi đỗ xe Giảng viên & Sinh viên"},{id:"KHUON_VIEN",name:"Khuôn viên cảnh quan & Đường nội bộ"}],ve={KHU_V:["V.101","V.102","V.201","V.202","V.301","V.302","V.401 (Phòng họp)","Văn phòng Khoa"],KHU_A:["A.101","A.102","A.201","A.202","A.203","A.301","A.302","A.303"],KHU_B:["Lab B.101 (Lập trình)","Lab B.102 (Đa phương tiện)","Lab B.201 (Trí tuệ nhân tạo AI)","Lab B.202 (Internet vạn vật IoT)","Lab B.301 (An toàn thông tin)","Phòng Server Trung tâm"],KHU_C:["C.101","C.102","C.201 (Hội trường lớn)","C.301 (Phòng Hội thảo quốc tế)"],KHU_K:["Phòng KTX 102","Phòng KTX 205","Phòng KTX 308","Phòng KTX 412","Khu tự học tầng 1","Khu giặt phơi"],THU_VIEN:["Tầng 1 - Khu tra cứu & Mượn sách","Tầng 2 - Không gian học nhóm MakerSpace","Tầng 3 - Phòng đọc điện tử"],THE_THAO:["Nhà thi đấu đa năng","Sân bóng đá cỏ nhân tạo","Khu bóng rổ & bóng chuyền"],CAN_TIN:["Sảnh ăn chính sinh viên","Khu chế biến dịch vụ","Khu quầy nước"],BAI_XE:["Bãi xe Nhà B","Bãi xe Ký túc xá","Bãi xe Nhà Điều hành V"],KHUON_VIEN:["Cổng chính đường Nam Kỳ Khởi Nghĩa","Quảng trường trung tâm","Khu ghế đá hồ điều hòa","Lối đi bộ nối Khu A & B"]},be=[{id:"PROJECTOR",name:"Máy chiếu, Màn chiếu & Remote",icon:"📽️"},{id:"AIR_CONDITIONER",name:"Điều hòa nhiệt độ & Điều khiển",icon:"❄️"},{id:"LIGHT_FAN",name:"Hệ thống đèn LED & Quạt trần/Quạt tường",icon:"💡"},{id:"FURNITURE",name:"Bàn ghế sinh viên & Bàn giảng viên",icon:"🪑"},{id:"NETWORK",name:"Bộ phát Wifi AP, Cáp mạng LAN & Tủ Rack",icon:"📶"},{id:"FIRE_SAFETY",name:"Bình chữa cháy, Chuông báo & Đèn Exit",icon:"🧯"},{id:"POWER_SOCKET",name:"Ổ cắm điện, Công tắc & Aptomat",icon:"🔌"},{id:"BOARD_CURTAIN",name:"Bảng từ/Bút viết & Rèm cửa chống nắng",icon:"📋"},{id:"DOOR_WINDOW",name:"Khóa cửa, Tay nắm & Cửa kính",icon:"🚪"},{id:"BUILDING_STRUCTURE",name:"Trần, Tường, Gạch nền & Sơn ẩm mốc",icon:"🧱"},{id:"SANITATION",name:"Nhà vệ sinh, Vòi nước & Bồn rửa",icon:"🚰"}];async function Ze(){return new Promise((e,t)=>{if(!navigator.geolocation){t(new Error("Trình duyệt của bạn không hỗ trợ định vị GPS (Geolocation)."));return}const n={enableHighAccuracy:!0,timeout:1e4,maximumAge:3e4};navigator.geolocation.getCurrentPosition(a=>{e({latitude:Number(a.coords.latitude.toFixed(6)),longitude:Number(a.coords.longitude.toFixed(6)),accuracy:Math.round(a.coords.accuracy),timestamp:new Date(a.timestamp).toISOString()})},a=>{let i="Không thể lấy vị trí hiện tại.";switch(a.code){case a.PERMISSION_DENIED:i="Bạn đã từ chối quyền truy cập vị trí GPS.";break;case a.POSITION_UNAVAILABLE:i="Tín hiệu GPS hiện trường không khả dụng.";break;case a.TIMEOUT:i="Quá thời gian chờ lấy tọa độ GPS.";break}t(new Error(i))},n)})}async function et(e,t=1024,n=.8){return new Promise((a,i)=>{const s=new FileReader;s.onload=r=>{const c=new Image;c.onload=()=>{let{width:o,height:l}=c;o>l?o>t&&(l=Math.round(l*t/o),o=t):l>t&&(o=Math.round(o*t/l),l=t);const h=document.createElement("canvas");h.width=o,h.height=l,h.getContext("2d").drawImage(c,0,0,o,l);const f=h.toDataURL("image/jpeg",n),ae=Math.round(f.length*3/4/1024);a({dataUrl:f,width:o,height:l,sizeKb:ae,originalName:e.name,capturedAt:new Date().toISOString()})},c.onerror=()=>i(new Error("Không thể đọc file hình ảnh.")),c.src=r.target.result},s.onerror=()=>i(new Error("Lỗi khi đọc file.")),s.readAsDataURL(e)})}let C=null;function tt(){return C||(C=document.getElementById("toast-container"),C||(C=document.createElement("div"),C.id="toast-container",C.className="toast-container",document.body.appendChild(C))),C}function g(e,t="info",n=3500){const a=tt(),i=document.createElement("div");i.className=`toast toast-${t}`;let s="ℹ️";t==="success"&&(s="✅"),t==="warning"&&(s="⚠️"),t==="danger"&&(s="🚨"),i.innerHTML=`
    <span>${s}</span>
    <span style="flex: 1;">${e}</span>
  `,a.appendChild(i),setTimeout(()=>{i.style.transition="opacity 0.3s, transform 0.3s",i.style.opacity="0",i.style.transform="translateY(10px)",setTimeout(()=>{i.remove()},300)},n)}let E=[],I=null;async function nt(e,t){const n=await ze("surveyor_name","");e.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">📝 Phiếu Kiểm Tra Cơ Sở Vật Chất</h2>
      </div>

      <form id="field-survey-form">
        <!-- Người kiểm tra -->
        <div class="form-group">
          <label class="form-label" for="surveyor-name">
            Họ tên người kiểm tra / Khảo sát viên <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="surveyor-name" 
            class="form-control" 
            placeholder="Ví dụ: Nguyễn Văn A - Lớp 21IT..." 
            value="${n}"
            required
          />
        </div>

        <!-- Chọn Khu nhà & Phòng -->
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label class="form-label" for="select-building">
              Khu vực / Tòa nhà <span class="required">*</span>
            </label>
            <select id="select-building" class="form-control" required>
              <option value="">-- Chọn tòa nhà --</option>
              ${pe.map(d=>`<option value="${d.id}">${d.name}</option>`).join("")}
            </select>
          </div>

          <div>
            <label class="form-label" for="select-room">
              Phòng / Vị trí cụ thể <span class="required">*</span>
            </label>
            <select id="select-room" class="form-control" required disabled>
              <option value="">-- Chọn khu trước --</option>
            </select>
          </div>
        </div>

        <!-- Hạng mục cơ sở vật chất -->
        <div class="form-group">
          <label class="form-label" for="select-category">
            Hạng mục thiết bị cần khảo sát <span class="required">*</span>
          </label>
          <select id="select-category" class="form-control" required>
            <option value="">-- Chọn hạng mục kiểm tra --</option>
            ${be.map(d=>`<option value="${d.id}">${d.icon} ${d.name}</option>`).join("")}
          </select>
        </div>

        <!-- Tình trạng thiết bị (Status radio cards) -->
        <div class="form-group">
          <label class="form-label">
            Tình trạng ghi nhận hiện trường <span class="required">*</span>
          </label>
          <div class="status-options">
            <label class="status-option-label selected-good" id="status-label-good">
              <input type="radio" name="survey-status" value="good" checked />
              <span class="status-option-text">✅ Hoạt động tốt / Bình thường</span>
            </label>

            <label class="status-option-label" id="status-label-warning">
              <input type="radio" name="survey-status" value="warning" />
              <span class="status-option-text">⚠️ Hư hỏng nhẹ / Cần bảo trì</span>
            </label>

            <label class="status-option-label" id="status-label-danger">
              <input type="radio" name="survey-status" value="danger" />
              <span class="status-option-text">🚨 Hỏng nặng / Mất an toàn / Thay thế gấp</span>
            </label>
          </div>
        </div>

        <!-- Định vị GPS -->
        <div class="form-group">
          <label class="form-label">Tọa độ GPS hiện trường</label>
          <div class="gps-box">
            <div class="gps-info" id="gps-display">
              Chưa lấy tọa độ GPS hiện trường.
            </div>
            <button type="button" id="btn-get-gps" class="btn-gps">
              📍 Lấy tọa độ
            </button>
          </div>
        </div>

        <!-- Chụp & Đính kèm ảnh hiện trường -->
        <div class="form-group">
          <label class="form-label">Hình ảnh minh chứng hiện trường (Chụp trực tiếp hoặc tải ảnh)</label>
          <input 
            type="file" 
            id="camera-file-input" 
            accept="image/*" 
            capture="environment" 
            multiple 
            style="display: none;" 
          />
          <div class="photo-upload-container" id="photo-dropzone">
            <div class="photo-upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <div style="font-weight: 600; font-size: 0.9rem;">Bấm để Chụp ảnh hoặc Tải ảnh hiện trường</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Tự động nén ảnh tối ưu lưu trữ Offline trong IndexedDB</div>
            </div>
          </div>
          <div class="photo-preview-grid" id="photo-preview-grid"></div>
        </div>

        <!-- Mô tả & Ghi chú -->
        <div class="form-group">
          <label class="form-label" for="survey-notes">
            Mô tả chi tiết sự cố / Ghi chú bổ sung
          </label>
          <textarea 
            id="survey-notes" 
            class="form-control" 
            placeholder="Ví dụ: Máy chiếu Panasonic bị ố vàng góc trái, điều khiển hết pin, cần thay bóng đèn LED số 2..."
          ></textarea>
        </div>

        <!-- Nút gửi & Lưu nháp -->
        <div class="form-actions">
          <button type="button" id="btn-save-draft" class="btn btn-secondary">
            💾 Lưu bản nháp
          </button>
          <button type="submit" id="btn-submit-survey" class="btn btn-primary">
            🚀 Gửi khảo sát
          </button>
        </div>
      </form>
    </div>
  `;const a=e.querySelector("#field-survey-form"),i=e.querySelector("#select-building"),s=e.querySelector("#select-room"),r=e.querySelector("#gps-display"),c=e.querySelector("#btn-get-gps"),o=e.querySelector("#photo-dropzone"),l=e.querySelector("#camera-file-input"),h=e.querySelector("#photo-preview-grid"),x=e.querySelector("#btn-save-draft"),f=e.querySelector("#surveyor-name");i.addEventListener("change",()=>{const d=i.value;s.innerHTML='<option value="">-- Chọn phòng / vị trí --</option>',d&&ve[d]?(s.disabled=!1,ve[d].forEach(u=>{const p=document.createElement("option");p.value=u,p.textContent=u,s.appendChild(p)})):s.disabled=!0}),e.querySelectorAll('input[name="survey-status"]').forEach(d=>{d.addEventListener("change",()=>{["good","warning","danger"].forEach(b=>{const L=e.querySelector(`#status-label-${b}`);L&&(L.className="status-option-label")});const u=a.querySelector('input[name="survey-status"]:checked').value,p=e.querySelector(`#status-label-${u}`);p&&p.classList.add(`selected-${u}`)})}),c.addEventListener("click",async()=>{c.disabled=!0,c.textContent="⏳ Đang quét...";try{I=await Ze(),r.innerHTML=`
        <div class="gps-coords">📍 ${I.latitude}, ${I.longitude}</div>
        <div style="font-size: 0.72rem; color: var(--color-success); font-weight: 600;">
          Độ chính xác: ±${I.accuracy}m (${new Date().toLocaleTimeString("vi-VN")})
        </div>
      `,g("Đã ghi nhận tọa độ GPS hiện trường.","success")}catch(d){r.innerHTML=`<span style="color: var(--color-danger);">${d.message}</span>`,g(d.message,"danger")}finally{c.disabled=!1,c.textContent="📍 Cập nhật GPS"}}),o.addEventListener("click",()=>{l.click()}),l.addEventListener("change",async d=>{const u=Array.from(d.target.files);if(!(!u||u.length===0)){for(const p of u)try{const b=await et(p,1024,.8);E.push(b)}catch{g("Lỗi xử lý hình ảnh.","danger")}se(h),l.value=""}});function se(d){d.innerHTML="",E.forEach((u,p)=>{const b=document.createElement("div");b.className="photo-preview-item",b.innerHTML=`
        <img src="${u.dataUrl}" alt="Ảnh hiện trường ${p+1}" />
        <button type="button" class="btn-remove-photo" data-idx="${p}">×</button>
      `,b.querySelector(".btn-remove-photo").addEventListener("click",V=>{V.stopPropagation(),E.splice(p,1),se(d)}),d.appendChild(b)})}function oe(d=!1){const u=i.value,p=pe.find(U=>U.id===u),b=a.querySelector("#select-category").value,L=be.find(U=>U.id===b),V=a.querySelector('input[name="survey-status"]:checked').value,ke=a.querySelector("#survey-notes").value.trim(),Be=f.value.trim();return{id:"survey_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),surveyorName:Be,building:u,buildingName:p?p.name:"",room:s.value,category:b,categoryName:L?L.name:"",categoryIcon:L?L.icon:"📋",status:V,notes:ke,location:I,photos:[...E],createdAt:new Date().toISOString(),syncStatus:d?"draft":y()?"synced":"pending",syncedAt:!d&&y()?new Date().toISOString():null}}function re(){i.value="",s.innerHTML='<option value="">-- Chọn khu trước --</option>',s.disabled=!0,a.querySelector("#select-category").value="",a.querySelector("#survey-notes").value="",a.querySelector('input[name="survey-status"][value="good"]').checked=!0,["warning","danger"].forEach(u=>{const p=e.querySelector(`#status-label-${u}`);p&&(p.className="status-option-label")});const d=e.querySelector("#status-label-good");d&&(d.className="status-option-label selected-good"),E=[],I=null,r.innerHTML="Chưa lấy tọa độ GPS hiện trường.",h.innerHTML=""}x.addEventListener("click",async()=>{if(!f.value.trim()){g("Vui lòng nhập họ tên người kiểm tra.","warning"),f.focus();return}await he("surveyor_name",f.value.trim());const d=oe(!0);await P(d),g("Đã lưu bản nháp vào IndexedDB!","success"),re(),t&&t()}),a.addEventListener("submit",async d=>{if(d.preventDefault(),!i.value||!s.value||!a.querySelector("#select-category").value){g("Vui lòng điền đầy đủ các thông tin bắt buộc (*).","warning");return}await he("surveyor_name",f.value.trim());const u=oe(!1);y()?(u.syncStatus="synced",u.syncedAt=new Date().toISOString(),await P(u),g("Đã gửi phiếu khảo sát thành công lên máy chủ!","success")):(u.syncStatus="pending",await P(u),await Fe(u),Qe(),g("📴 Đang ngoại tuyến. Phiếu đã được lưu an toàn vào IndexedDB và xếp vào hàng đợi đồng bộ.","warning",4500)),re(),t&&t()})}let v=null;function it(e){if(v=document.getElementById("detail-modal"),!v)return;const t=v.querySelector(".modal-close");t&&t.addEventListener("click",$),v.addEventListener("click",n=>{n.target===v&&$()}),window.addEventListener("keydown",n=>{n.key==="Escape"&&v.classList.contains("active")&&$()})}function at(e,t){if(v||(v=document.getElementById("detail-modal")),!v)return;const n=v.querySelector(".modal-body"),a=v.querySelector(".modal-title");a.textContent=`${e.room||"Chưa rõ"} - ${e.buildingName||"Khu nhà"}`;let i="";e.status==="good"?i='<span class="badge badge-good">✅ Bình thường</span>':e.status==="warning"?i='<span class="badge badge-warning">⚠️ Cần bảo trì</span>':i='<span class="badge badge-danger">🚨 Hỏng nặng / Khẩn cấp</span>';let s="";e.syncStatus==="synced"?s='<span class="badge badge-synced">☁️ Đã đồng bộ máy chủ</span>':e.syncStatus==="pending"?s='<span class="badge badge-pending">⏳ Chờ đồng bộ (Offline)</span>':s='<span class="badge badge-draft">📝 Bản nháp</span>';const r=e.photos&&e.photos.length>0?`
      <div style="margin-top: 14px;">
        <label class="form-label">Hình ảnh hiện trường (${e.photos.length}):</label>
        <div class="photo-preview-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));">
          ${e.photos.map((h,x)=>`
            <a href="${h.dataUrl}" target="_blank" title="Xem ảnh gốc" class="photo-preview-item" style="cursor: zoom-in;">
              <img src="${h.dataUrl}" alt="Ảnh lỗi ${x+1}" />
            </a>
          `).join("")}
        </div>
      </div>
    `:'<div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-muted);">Không có hình ảnh đính kèm.</div>',c=e.location&&e.location.latitude?`
      <div class="gps-box" style="margin-top: 12px;">
        <div class="gps-info">
          <div>📍 Tọa độ GPS: <b>${e.location.latitude}, ${e.location.longitude}</b></div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Độ chính xác: ±${e.location.accuracy||0}m</div>
        </div>
        <a href="https://maps.google.com/?q=${e.location.latitude},${e.location.longitude}" target="_blank" class="btn-gps" style="text-decoration: none;">
          Mở bản đồ
        </a>
      </div>
    `:"";n.innerHTML=`
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
      ${i}
      ${s}
    </div>

    <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-md); font-size: 0.9rem; line-height: 1.6;">
      <div><b>Hạng mục:</b> ${e.categoryName||"Chưa phân loại"}</div>
      <div><b>Khu vực:</b> ${e.buildingName||""} - ${e.room||""}</div>
      <div><b>Người kiểm tra:</b> ${e.surveyorName||"Cán bộ khảo sát VKU"}</div>
      <div><b>Thời gian tạo:</b> ${new Date(e.createdAt).toLocaleString("vi-VN")}</div>
      ${e.syncedAt?`<div><b>Thời gian đồng bộ:</b> ${new Date(e.syncedAt).toLocaleString("vi-VN")}</div>`:""}
    </div>

    ${c}

    <div style="margin-top: 14px;">
      <label class="form-label">Ghi chú chi tiết sự cố:</label>
      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem; white-space: pre-wrap;">
        ${e.notes?e.notes:"<i>Không có ghi chú thêm.</i>"}
      </div>
    </div>

    ${r}

    <div style="margin-top: 24px; display: flex; gap: 10px; justify-content: flex-end;">
      <button id="btn-delete-survey" class="btn" style="background: var(--color-danger-bg); color: var(--color-danger); border: 1px solid rgba(239,68,68,0.3); padding: 10px 14px;">
        🗑️ Xóa phiếu
      </button>
      <button id="btn-close-modal" class="btn btn-secondary" style="padding: 10px 18px;">
        Đóng
      </button>
    </div>
  `,n.querySelector("#btn-delete-survey").addEventListener("click",async()=>{confirm("Bạn có chắc chắn muốn xóa bản ghi khảo sát này?")&&(await Le(e.id),g("Đã xóa phiếu khảo sát.","warning"),$(),t&&t())}),n.querySelector("#btn-close-modal").addEventListener("click",$),v.classList.add("active")}function $(){v&&v.classList.remove("active")}let T="all",K="";async function ie(e,t){const n=await _();e.innerHTML=`
    <div class="card" style="padding: 14px 16px; margin-bottom: 12px;">
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <input 
          type="text" 
          id="survey-search-input" 
          class="form-control" 
          placeholder="🔍 Tìm theo phòng, tòa nhà, thiết bị..." 
          value="${K}"
          style="padding: 8px 12px; font-size: 0.88rem;"
        />
      </div>

      <div class="filter-tabs" id="survey-filter-tabs">
        <button class="filter-btn ${T==="all"?"active":""}" data-filter="all">
          Tất cả (${n.length})
        </button>
        <button class="filter-btn ${T==="pending"?"active":""}" data-filter="pending">
          ⏳ Chờ gửi (${n.filter(c=>c.syncStatus==="pending").length})
        </button>
        <button class="filter-btn ${T==="synced"?"active":""}" data-filter="synced">
          ☁️ Đã đồng bộ (${n.filter(c=>c.syncStatus==="synced").length})
        </button>
        <button class="filter-btn ${T==="draft"?"active":""}" data-filter="draft">
          📝 Nháp (${n.filter(c=>c.syncStatus==="draft").length})
        </button>
      </div>
    </div>

    <div id="survey-cards-container"></div>
  `;const a=e.querySelector("#survey-search-input"),i=e.querySelector("#survey-filter-tabs"),s=e.querySelector("#survey-cards-container");function r(){let c=n;if(T!=="all"&&(c=c.filter(o=>o.syncStatus===T)),K.trim()){const o=K.toLowerCase();c=c.filter(l=>l.room&&l.room.toLowerCase().includes(o)||l.buildingName&&l.buildingName.toLowerCase().includes(o)||l.categoryName&&l.categoryName.toLowerCase().includes(o)||l.notes&&l.notes.toLowerCase().includes(o))}if(c.length===0){s.innerHTML=`
        <div class="card" style="text-align: center; padding: 36px 20px;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">📋</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 6px;">Không tìm thấy phiếu khảo sát nào</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 18px;">
            ${T!=="all"?"Chưa có bản ghi nào trong mục này.":"Hãy tạo phiếu khảo sát cơ sở vật chất đầu tiên."}
          </p>
          <button id="btn-empty-create" class="btn btn-primary" style="margin: 0 auto; padding: 10px 18px; font-size: 0.85rem;">
            ➕ Tạo phiếu khảo sát mới
          </button>
        </div>
      `;const o=s.querySelector("#btn-empty-create");o&&t&&o.addEventListener("click",t);return}s.innerHTML=c.map(o=>{let l="";o.status==="good"?l='<span class="badge badge-good">✅ Bình thường</span>':o.status==="warning"?l='<span class="badge badge-warning">⚠️ Cần bảo trì</span>':l='<span class="badge badge-danger">🚨 Hỏng nặng</span>';let h="";o.syncStatus==="synced"?h='<span class="badge badge-synced">☁️ Đã đồng bộ</span>':o.syncStatus==="pending"?h='<span class="badge badge-pending">⏳ Chờ gửi</span>':h='<span class="badge badge-draft">📝 Nháp</span>';const x=o.photos&&o.photos.length>0?`<span style="font-size: 0.75rem; background: var(--bg-input); padding: 2px 6px; border-radius: 4px;">📷 ${o.photos.length} ảnh</span>`:"",f=o.location?'<span style="font-size: 0.75rem; background: var(--bg-input); padding: 2px 6px; border-radius: 4px;">📍 GPS</span>':"";return`
        <div class="survey-item" data-id="${o.id}">
          <div class="survey-item-header">
            <div>
              <div class="survey-location">${o.room||"Chưa rõ phòng"} - ${o.buildingName||""}</div>
              <div class="survey-category">${o.categoryIcon||"📋"} ${o.categoryName||"Thiết bị"}</div>
            </div>
            ${l}
          </div>

          <div style="display: flex; gap: 6px; align-items: center;">
            ${x}
            ${f}
            ${o.notes?`<span style="font-size: 0.75rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">💬 ${o.notes}</span>`:""}
          </div>

          <div class="survey-meta">
            <div>${h}</div>
            <div>${new Date(o.createdAt).toLocaleDateString("vi-VN")} ${new Date(o.createdAt).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
        </div>
      `}).join(""),s.querySelectorAll(".survey-item").forEach(o=>{o.addEventListener("click",()=>{const l=o.getAttribute("data-id"),h=n.find(x=>x.id===l);h&&at(h,()=>{ie(e,t)})})})}a.addEventListener("input",c=>{K=c.target.value,r()}),i.querySelectorAll(".filter-btn").forEach(c=>{c.addEventListener("click",()=>{i.querySelectorAll(".filter-btn").forEach(o=>o.classList.remove("active")),c.classList.add("active"),T=c.getAttribute("data-filter"),r()})}),r()}async function M(e,t){const n=await Te(),a=y();e.innerHTML=`
    <!-- Trạng thái kết nối hiện tại -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">📡 Trạng Thái Kết Nối & Hàng Đợi</h2>
        <span class="network-badge ${a?"online":"offline"}">
          <span class="status-dot"></span>
          ${a?"Trực tuyến (Online)":"Ngoại tuyến (Offline)"}
        </span>
      </div>

      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
        ${a?"Hệ thống đang kết nối internet. Mọi dữ liệu mới sẽ được gửi ngay lên máy chủ hoặc đồng bộ ngầm.":"Hệ thống đang hoạt động ở chế độ <b>Offline-First</b>. Dữ liệu khảo sát và ảnh được lưu trữ an toàn trong <b>IndexedDB</b> cục bộ."}
      </p>

      <!-- Thống kê số lượng bản ghi -->
      <div class="sync-stat-grid">
        <div class="stat-box">
          <div class="stat-number" style="color: var(--vku-orange);" id="stat-pending">${n.pendingCount}</div>
          <div class="stat-label">Chờ đồng bộ</div>
        </div>
        <div class="stat-box">
          <div class="stat-number" style="color: var(--color-success);" id="stat-synced">${n.syncedCount}</div>
          <div class="stat-label">Đã đồng bộ</div>
        </div>
        <div class="stat-box">
          <div class="stat-number" style="color: var(--vku-navy-light);" id="stat-total">${n.totalSurveys}</div>
          <div class="stat-label">Tổng số phiếu</div>
        </div>
      </div>

      <!-- Nút kích hoạt đồng bộ -->
      <button id="btn-trigger-sync" class="btn btn-primary" style="width: 100%; margin-top: 6px;">
        🔄 Đồng bộ dữ liệu ngay (${n.pendingCount} phiếu)
      </button>
    </div>

    <!-- Quản lý Bộ nhớ IndexedDB -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">💾 Bộ Nhớ Cục Bộ (IndexedDB)</h2>
      </div>
      
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
        Dung lượng đã sử dụng: <b>${n.storageUsageMB} MB</b>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${Math.min(100,Math.max(5,n.storageUsageBytes/(1024*1024*50)*100))}%;"></div>
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 16px;">
        Lưu trữ ảnh hiện trường, bản nháp và hàng đợi Service Worker hoàn toàn trên thiết bị client.
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button id="btn-export-json" class="btn btn-secondary" style="font-size: 0.85rem; padding: 10px;">
          📥 Xuất file JSON
        </button>
        <button id="btn-clean-synced" class="btn btn-secondary" style="font-size: 0.85rem; padding: 10px; color: var(--text-secondary);">
          🧹 Dọn phiếu đã sync
        </button>
      </div>
    </div>

    <!-- Hướng dẫn Kiểm thử Offline-First cho Giảng viên / Ban Giám Khảo -->
    <div class="card" style="background: var(--color-info-bg); border-color: rgba(2, 132, 199, 0.3);">
      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--color-info); margin-bottom: 8px;">
        🧪 Hướng dẫn Kiểm tra Tính năng Offline-First:
      </h3>
      <ol style="font-size: 0.82rem; color: var(--text-secondary); padding-left: 18px; line-height: 1.6;">
        <li>Mở <b>F12 (DevTools)</b> $\rightarrow$ Chọn tab <b>Network</b> $\rightarrow$ Chuyển sang <b>Offline</b> (hoặc tắt Wi-Fi).</li>
        <li>Tải lại trang (F5): Ứng dụng vẫn hoạt động 100% nhờ <b>Service Worker App Shell Cache</b>.</li>
        <li>Tạo phiếu khảo sát kèm chụp ảnh hiện trường và bấm <b>Gửi khảo sát</b>.</li>
        <li>Quan sát phiếu được lưu tức thì vào <b>IndexedDB</b> với huy hiệu <i>"Chờ gửi"</i> và hàng đợi <b>sync_queue</b>.</li>
        <li>Bật lại mạng (Online) hoặc bấm <b>"Đồng bộ dữ liệu ngay"</b>: Dữ liệu tự động đẩy lên máy chủ và đổi trạng thái thành <i>"Đã đồng bộ"</i>.</li>
      </ol>
    </div>
  `;const i=e.querySelector("#btn-trigger-sync"),s=e.querySelector("#btn-export-json"),r=e.querySelector("#btn-clean-synced");i.addEventListener("click",async()=>{if(!y()){g("Thiết bị đang Offline. Vui lòng kết nối mạng để đồng bộ.","warning");return}i.disabled=!0,i.innerHTML="⏳ Đang đồng bộ dữ liệu...";try{const c=await q();c.success?g(`Đồng bộ thành công ${c.syncedCount} phiếu khảo sát!`,"success"):g(c.message||"Có lỗi trong quá trình đồng bộ.","warning")}catch(c){g("Lỗi đồng bộ: "+c.message,"danger")}finally{i.disabled=!1,M(e,t),t&&t()}}),s.addEventListener("click",async()=>{await Ye(),g("Đã tải xuống file dữ liệu khảo sát JSON.","success")}),r.addEventListener("click",async()=>{if(confirm("Bạn có muốn xóa các phiếu đã đồng bộ thành công để giải phóng bộ nhớ? (Các phiếu chưa đồng bộ sẽ được giữ nguyên)")){const o=(await _()).filter(l=>l.syncStatus==="synced");for(const l of o)await Le(l.id);g(`Đã dọn dẹp ${o.length} phiếu đã đồng bộ.`,"success"),M(e,t),t&&t()}})}function st(e){const t="serviceWorker"in navigator,n="indexedDB"in window,a="SyncManager"in window,i="geolocation"in navigator,s=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)||"HTMLInputElement"in window;e.innerHTML=`
    <!-- Giới thiệu đề tài -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🏫 VKU Field Survey App</h2>
      </div>
      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
        Ứng dụng khảo sát hiện trường cơ sở vật chất (phòng học, máy chiếu, điều hòa, phòng lab, PCCC...) tại 
        <b>Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)</b> theo mô hình chuẩn <b>Offline-First Progressive Web App (PWA)</b>.
      </p>

      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); font-size: 0.82rem; line-height: 1.6;">
        <div><b>Học phần:</b> Phát triển Ứng dụng Đa Nền tảng</div>
        <div><b>Đề tài:</b> Mini-Project 1 - PWA Khảo Sát Hiện Trường</div>
        <div><b>Cầu nối Android:</b> Sẵn sàng tích hợp Capacitor Bridge (APK)</div>
      </div>
    </div>

    <!-- Kiểm tra tính năng PWA Thiết bị -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">⚙️ Khả Năng Tương Thích Thiết Bị</h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Service Worker (Bộ nhớ đệm App Shell)</span>
          <span style="font-weight: 700; color: ${t?"var(--color-success)":"var(--color-danger)"};">
            ${t?"✅ Đã hỗ trợ":"❌ Không hỗ trợ"}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>IndexedDB (Kho dữ liệu Offline client)</span>
          <span style="font-weight: 700; color: ${n?"var(--color-success)":"var(--color-danger)"};">
            ${n?"✅ Đã hỗ trợ":"❌ Không hỗ trợ"}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Background Sync API (Đồng bộ ngầm)</span>
          <span style="font-weight: 700; color: ${a?"var(--color-success)":"var(--color-warning)"};">
            ${a?"✅ Đã hỗ trợ":"⚠️ Fallback Online Event"}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
          <span>Geolocation (Định vị GPS hiện trường)</span>
          <span style="font-weight: 700; color: ${i?"var(--color-success)":"var(--color-danger)"};">
            ${i?"✅ Đã hỗ trợ":"❌ Không hỗ trợ"}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
          <span>Camera & Nén ảnh hiện trường</span>
          <span style="font-weight: 700; color: ${s?"var(--color-success)":"var(--color-danger)"};">
            ${s?"✅ Sẵn sàng":"❌ Không hỗ trợ"}
          </span>
        </div>
      </div>
    </div>

    <!-- Nguyên lý Offline-First -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">💡 Giải Pháp Kỹ Thuật Offline-First</h2>
      </div>
      <ul style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.6; padding-left: 18px;">
        <li><b>App Shell Architecture:</b> Tải ngay lập tức giao diện người dùng từ Cache Storage mà không cần chờ nạp qua mạng internet (Zero-network cold start).</li>
        <li><b>Local Persistence:</b> Mọi thao tác ghi nhận (phiếu khảo sát, ảnh hiện trường nén, tọa độ GPS) đều được ghi vào IndexedDB trước tiên.</li>
        <li><b>Resilient Sync Queue:</b> Hàng đợi offline đảm bảo không bao giờ mất dữ liệu dù mất điện, tắt trình duyệt hoặc mất kết nối 4G/Wifi.</li>
        <li><b>Capacitor Ready:</b> Đóng gói code HTML/JS/CSS độc lập, tương thích 100% với Capacitor WebView Android/iOS.</li>
      </ul>
    </div>
  `}const ye=document.getElementById("header-network-badge"),fe=document.getElementById("header-network-text"),me=document.getElementById("offline-banner"),z=document.getElementById("btn-install-pwa"),j=document.getElementById("nav-sync-badge"),m={"tab-new":document.getElementById("tab-new"),"tab-history":document.getElementById("tab-history"),"tab-sync":document.getElementById("tab-sync"),"tab-about":document.getElementById("tab-about")};let ne="tab-new";function Q(e){e?(ye.className="network-badge online",fe.textContent="Online",me.classList.remove("active")):(ye.className="network-badge offline",fe.textContent="Offline",me.classList.add("active"))}async function k(){const e=await Te();e.pendingCount>0?(j.textContent=e.pendingCount,j.classList.add("has-items")):j.classList.remove("has-items")}function N(e){m[e]&&(ne=e,Object.keys(m).forEach(t=>{t===e?m[t].classList.add("active"):m[t].classList.remove("active")}),document.querySelectorAll(".bottom-nav .nav-item").forEach(t=>{t.getAttribute("data-tab")===e?t.classList.add("active"):t.classList.remove("active")}),e==="tab-history"?ie(m["tab-history"],()=>N("tab-new")):e==="tab-sync"?M(m["tab-sync"],()=>{k()}):e==="tab-about"&&st(m["tab-about"]),window.scrollTo({top:0,behavior:"smooth"}))}async function Se(){console.log("[App] Khởi động VKU Field Survey App..."),Ee(),Je(),Q(y()),window.addEventListener("online",()=>{Q(!0),g("Đã kết nối internet trở lại! Đang tự động đồng bộ...","success"),k()}),window.addEventListener("offline",()=>{Q(!1),g("Mất kết nối internet. Chuyển sang chế độ Offline-First.","warning"),k()}),je(async e=>{await k(),ne==="tab-sync"?M(m["tab-sync"],()=>k()):ne==="tab-history"&&ie(m["tab-history"],()=>N("tab-new"))}),Ie(e=>{e?z.classList.add("visible"):z.classList.remove("visible")}),z.addEventListener("click",async()=>{await Ae()&&g("Đang cài đặt VKU Field Survey App...","success")}),window.addEventListener("vku-sw-update-available",()=>{g("Có bản cập nhật mới! Tải lại trang để áp dụng.","info",6e3)}),document.querySelectorAll(".bottom-nav .nav-item").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-tab");N(t)})}),it(),await nt(m["tab-new"],async()=>{await k()}),await k(),window.location.hash==="#sync"?N("tab-sync"):window.location.hash==="#history"&&N("tab-history")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Se):Se();

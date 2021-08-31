<section id="appointment" class=" bg-white">
   <div class="container">
      <div class="row">
         <div class="col-12 col-md-6">
            <img class=" d-md-none img-mobile" src="assets/img/10.jpg" alt="">
            <div class="position-relative h-100 vw-50 float-right  d-none d-md-block">
               <div class="w-100 h-100 ">
                  <img class="bg-image" src="assets/img/10.jpg" alt="">
               </div>
            </div>
         </div>
         <div class="col-12 col-md-6 col-lg-5 offset-lg-1 spacer-double-lg">
            <div class="mb-3 pb-3">
               <span class="text-uppercase text-secondary font-secondary font-size-12">get in touch</span>       
               <h1 class="mb-0">Join the Class</h1>
               <img class=" max-width-4" src="assets/svg/title-line.svg" alt="">
            </div>
            <form id="form" method="POST" action="/success">
               <div class="d-flex flex-column  form-group">
                  <input class="form-control mb-3 h-100" name="name" placeholder="Name" type="text">
                  <input class="form-control mb-3 h-100" name="email" placeholder="Email" type="email">
                  <input class="form-control mb-3 h-100" name="phone" placeholder="Phone Number" type="phone2numeric">
                  <input name="cls" value="intermediate" type="hidden">//<---Enter class name in Value
                  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                  <button class="btn w-50 btn-primary" type="submit">
                  <span class="mn-top">Get an Appointment</span>
                  </button>
               </div>
            </form>
         </div>
      </div>
   </div>
</section>
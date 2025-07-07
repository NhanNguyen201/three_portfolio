import { App } from "./src/apps";


let isDev = false;

(() => {
    let activeSection = null;
    
    if(isDev) {
        document.body.style.backgroundColor = "black"
    } else {
        const threeApp = new App({
        
            dom: document.querySelector("#threeCanvas")
        })
        threeApp.init();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(ent => {
                if(ent.isIntersecting) {
                    let currentSectionName = ent.target.attributes.getNamedItem("data-sectionName").value
                    if(currentSectionName) {
                        activeSection = currentSectionName
                        threeApp.scollTo(activeSection)
                    }
                }
            })
            }, {
                rootMargin: "20px",
                threshold: 0.4
            }
        )
        const sections = document.querySelectorAll(".viewSection")
        sections.forEach(s => observer.observe(s))
    }
    

    
    const expDiv = document.querySelector("#exp")
    const openEls = expDiv.querySelectorAll("[data-open]");
    const closeEls = document.querySelectorAll("[data-close]");

    const isVisible = "is-visible";

    for (const el of openEls) {
        el.addEventListener("click", function() {
            const modalId = this.dataset.open;
            document.getElementById(modalId).classList.add(isVisible);
        });
    }
    for (const el of closeEls) {
        el.addEventListener("click", function() {
            this.parentElement.parentElement.parentElement.classList.remove(isVisible);
        });
    }
    expDiv.addEventListener("click", e => {
        if (e.target == expDiv.querySelector(".modal.is-visible")) {
            expDiv.querySelector(".modal.is-visible").classList.remove(isVisible);
        }
    });
    
    document.addEventListener("keyup", e => {
        // if we press the ESC
        if (e.key == "Escape" && expDiv.querySelector(".modal.is-visible")) {
            expDiv.querySelector(".modal.is-visible").classList.remove(isVisible);
        }
    });

})()

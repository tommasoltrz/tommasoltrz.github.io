if (document.title != "Tommaso Laterza") { // in case of refresh
    window.open("index.html", "_self")
}



document.addEventListener('DOMContentLoaded', function() {

    var loader = document.getElementById('loader');
    loader.parentNode.removeChild(loader);

    var section1 = document.getElementById('contactsTop');
    var section3 = document.getElementById('projectsLeft');

    var subtext = ["█", "▒", "░", "▒", "░", "▒", "░", "<", ">", "#"];
    var subtexttwo = ["@", "▒", "", "#", "░"];

    const b = baffle(document.getElementById('contactsTop'));
    const c = baffle(document.getElementById('projectsLeft'));

    b.set({
        characters: subtexttwo,
        speed: 100
    });
    c.set({
        characters: subtexttwo,
        speed: 100
    });

    section1.onmouseover = function() {
        b.reveal(1000);
    }
    section3.onmouseover = function() {
        c.reveal(1000);
    }

    var invertedColours = false;
    document.getElementsByTagName("BODY")[0].ondblclick = function() {
        if (document.title == "Tommaso Laterza") {
            if (!invertedColours) {
                invertedColours = true;
                document.getElementsByTagName("BODY")[0].style.backgroundColor = "#2C353A";
            } else {
                invertedColours = false;
                document.getElementsByTagName("BODY")[0].style.backgroundColor = "white";
            }
        }
    };


    // ########## page transition ########## //


    var lastElementClicked;
    var nav_contacts = document.querySelector('a.conTop');
    var nav_projects = document.querySelector('a.projLeft');
    var nav_single_project = document.querySelector('a.single_project_link');
    var home = document.querySelector('a.home');


    Barba.Pjax.init();
    Barba.Prefetch.init();
    Barba.Dispatcher.on('linkClicked', function(el) {
        lastElementClicked = el;
    });


    // ########## PAGE TRANSITIONS ########## //

    var MovePage = Barba.BaseTransition.extend({
        start: function() {
            this.originalThumb = lastElementClicked;
            Promise
                .all([this.newContainerLoading])
                .then(this.GoToPage.bind(this));
        },
        GoToPage: function() {
            if (document.title != "Tommaso Laterza") { // in case of refresh
                explode();
            }
            if (invertedColours) {
                invertedColours = false;
                document.getElementsByTagName("BODY")[0].style.backgroundColor = "#fff";
            }
            var _this = this;

            this.updateLinks();
            document.getElementById("nav_container").style.backgroundColor = "white";
            TweenLite.set(this.newContainer, {
                visibility: 'visible',
                position: 'fixed',
                left: 0,
                top: 0,
                right: 0,
                opacity: 0
            });

            TweenLite.to(this.oldContainer, 0.5, {
                opacity: 0,
                delay: 0.5,
            });

            TweenLite.to(this.newContainer, 0.5, {
                top: 0,
                delay: 1,
                opacity: 0.5,
                onComplete: function() {
                    TweenLite.set(_this.newContainer, {
                        clearProps: 'all'
                    });
                    clearInterval(LoadingModels);
                    _this.done();
                }
            });
        },
        updateLinks: function() {
            nav_contacts.href = this.newContainer.dataset.cont;
            nav_projects.href = this.newContainer.dataset.proj;
        },
        getNewPageFile: function() {
            return
            Barba.HistoryManager.currentStatus().url.split('/').pop();
        }
    });

    // ########## SINGLE PROJECT TRANSITIONS ########## //

    var MoveToSingleProject = Barba.BaseTransition.extend({
        start: function() {
            this.originalThumb = lastElementClicked;

            Promise
                .all([this.newContainerLoading, this.scrollTop()])
                .then(this.goToProject.bind(this));

        },
        scrollTop: function() {
            var deferred = Barba.Utils.deferred();
            var obj = {
                y: window.pageYOffset
            };

            TweenLite.to(obj, 0.5, {
                y: 0,
                onUpdate: function() {
                    if (obj.y === 0) {
                        deferred.resolve();
                    }

                    window.scroll(0, obj.y);
                },
                onComplete: function() {
                    deferred.resolve();
                }
            });

            return deferred.promise;
        },

        goToProject: function() {
            var _this = this;
            this.updateLinks();

            TweenLite.set(this.newContainer, {
                visibility: 'visible',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                opacity: 0,
            });
            TweenLite.to(this.oldContainer, 0.5, {
                delay: 1,
                opacity: 0
            });

            TweenLite.to(this.newContainer, 0.8, {
                top: 0,
                right: 0,
                opacity: 0,
                delay: 0.5,
                onComplete: function() {
                    TweenLite.set(_this.newContainer, {
                        clearProps: 'all',
                    });
                    _this.done();
                }
            });
        },
        updateLinks: function() {
            nav_contacts.href = this.newContainer.dataset.cont;
            nav_projects.href = this.newContainer.dataset.proj;
        },
        getNewPageFile: function() {
            return
            Barba.HistoryManager.currentStatus().url.split('/').pop();
        }
    });

    Barba.Pjax.getTransition = function() {
        if (lastElementClicked == nav_contacts || lastElementClicked == nav_projects) {
            return MovePage;
        } else {
            return MoveToSingleProject;
        }
    };

    // ########## HOME TRANSITIONS ########## //

    var home = Barba.BaseView.extend({
        namespace: 'home',
        onEnterCompleted: function() {
            init();

            document.getElementById("nav_container").style.backgroundColor = "rgba(0,0,0,0)";
            if (document.getElementById("contactsTop").textContent != "CONTACTS") {
                b.text(text => 'CONTACTS');
                b.reveal(1000);
            }
            if (document.getElementById("projectsLeft").textContent != "PROJECTS") {
                c.text(text => 'PROJECTS');
                c.reveal(1000);
            }
        }
    });
    home.init();

    // ########## CONTACTS TRANSITIONS ########## //

    var contacts = Barba.BaseView.extend({
        namespace: 'contacts',
        onEnterCompleted: function() {

            contactEntered();
        },
        onLeave: function() {
            TweenLite.to("#tommaso", 0.5, {
                opacity: 0,
            });
            const contact_title = baffle(document.getElementById('tommasolaterza'));
            contact_title.set({
                characters: '#@><',
                speed: 100
            });
            contact_title.start();
            contact_title.text(text => '00');
        }
    });
    contacts.init();

    // ########## PROJECT PAGE TRANSITIONS ########## //

    var projectsPage = Barba.BaseView.extend({
        namespace: 'projectsPage',
        onEnterCompleted: function() {
            if (document.getElementById("contactsTop").textContent != "CONTACTS") {
                b.text(text => 'CONTACTS');
                b.reveal(1000);
            }

            c.text(text => '. . / HOME');
            c.reveal(1000);

            nav_single_project = document.querySelector('a.single_project_link');
            var body = document.getElementsByTagName("BODY")[0];
            setBackground();
            body.onresize = function() {
                setBackground();
            };

            function setBackground() {
                var containers = document.getElementsByClassName("col-projects");

                for (var a = 0; a < containers.length; a++) {
                    var images = containers[a].childNodes[0].nextElementSibling;
                    var gradients = containers[a].getElementsByClassName("gradient")[0];

                    if (images.tagName == "VIDEO") {
                        TweenLite.to(gradients, 0, {
                            height: images.offsetHeight,
                            top: 0,
                        });
                        TweenLite.to(gradients, 0.8, {
                            width: images.offsetWidth,
                            zIndex: -1
                        });
                    } else {
                        TweenLite.to(gradients, 0, {
                            height: images.height,
                            top: 0,
                        });
                        TweenLite.to(gradients, 0.8, {
                            width: images.width,
                            zIndex: -1
                        });
                    }
                }
                TweenLite.to('.image', 1.2, {
                    opacity: 1,
                    delay: 0.8,
                });
            }
        },
        onLeave: function() {
            TweenLite.to('.image', 0.5, {
                opacity: 0,
                onComplete: function() {
                    var containers = document.getElementsByClassName("col-projects");
                    for (var a = 0; a < containers.length; a++) {
                        var gradients = containers[a].getElementsByClassName("gradient")[0];
                        TweenLite.to(gradients, 0.5, {
                            width: 0,
                        });
                    }
                }
            });
        }
    });
    projectsPage.init();

    /////////// SINGLE PROJECTS ///////////

    var controller;
    var scene;
    var single_project_namespace = Barba.BaseView.extend({
        namespace: 'single_project_namespace',
        onEnter: function() {},
        onEnterCompleted: function() {

            lightGallery(document.getElementById('lightgallery'));
            b.text(text => 'PROJECTS');
            b.reveal(1000);

            const u = baffle(document.getElementById('prev_btn'));
            var buttonprev = document.getElementById('prev_btn');
            const v = baffle(document.getElementById('next_btn'));
            var buttonnext = document.getElementById('next_btn');

            u.set({
                characters: "PREV",
                speed: 100
            });
            v.set({
                characters: "PREV",
                speed: 100
            });

            buttonprev.onmouseover = function() {
                u.reveal(1000);
            }
            buttonnext.onmouseover = function() {
                v.reveal(1000);
            }

            var body = document.getElementsByTagName("BODY")[0];
            var parent = document.getElementsByClassName("single_project_row");
            var container = document.getElementById("single_project_image_container");
            var image = document.getElementById("single_project_Image");
            var offsetY = (container.offsetTop + parent[0].offsetTop) * 100 / window.innerWidth;

            setImageBackground();

            var resizeId;
            window.onresize = function() {
                clearTimeout(resizeId);
                resizeId = setTimeout(doneResizing, 500);
            };

            function doneResizing() {
                if (window.innerWidth > 720) {
                    setImageBackground();
                }
            }

            if (window.innerWidth >= 720) {
                // init controller
                controller = new ScrollMagic.Controller();

                var tween = TweenLite.to(image, 0.5, {
                    backgroundPosition: "inherit 400px",
                    yoyo: false,
                });
                // build scene and set duration to window height
                scene = new ScrollMagic.Scene({
                        triggerElement: container,
                        duration: "100%",
                        triggerHook: 110 / window.innerHeight,
                    })
                    .setTween(tween)
                    // .addIndicators({name: "1 (duration: 100%)"})
                    .addTo(controller);

            }


            function setImageBackground() {

                var container_width = (window.innerWidth / 100) * 65;
                var container_height = (container_width / 100) * 55;
                var image_width;

                if (image.tagName == "VIDEO") {
                    image.height = container_height;
                    image.width = container_width;
                } else {
                    // var image_background_size = String(container_width) + "px " + String(container_height) + "px";
                    // image.style.backgroundPosition = "50% " + offsetY * (window.innerWidth) / (window.innerHeight - container_height) + "%";

                    if (window.innerWidth > 1280) {
                        image_width = 1100;
                        image.style.backgroundSize = image_width + "px";
                        image.style.backgroundPosition = "50% 110px";
                    } else if (window.innerWidth <= 1280 && window.innerWidth > 1024) {
                        image_width = 800;
                        image.style.backgroundSize = image_width + "px";
                        image.style.backgroundPosition = "50% 110px";
                    } else if (window.innerWidth <= 1024) {
                        image_width = container_width;
                        image.style.backgroundSize = image_width + "px";
                        image.style.backgroundPosition = "50% " + offsetY * (window.innerWidth) / (window.innerHeight - container_height) + "%";
                    }

                }

                TweenLite.set(container, {
                    y: 400,
                    width: container_width,
                    height: 0
                });
                TweenLite.set(".single_project_content_row, .video, .btn", {
                    opacity: 0
                });
                TweenLite.set("#single_project_title_span", {
                    opacity: 0
                });

                tweetone = TweenLite.to(container, 1, {
                    height: image_width * 0.56,
                    y: 0,
                    onComplete: function() {
                        TweenLite.to("#single_project_title_span", 0.5, {
                            opacity: 1,
                            onComplete: function() {
                                TweenLite.to(".single_project_content_row, .video, .btn", 0.5, {
                                    opacity: 1
                                })
                            }
                        })
                    }
                });
            }
        },
        onLeave: function() {
            if (window.innerWidth >= 720) controller = controller.destroy(true);
            var container = document.getElementById("single_project_image_container");
            TweenLite.to(".single_project_content_row, .video", 0.5, {
                opacity: 0
            });
            TweenLite.to("#single_project_title_span", 0.5, {
                opacity: 0,
                onComplete: function() {
                    TweenLite.to(container, 0.5, {
                        height: 0,
                        y: 400
                    })
                }
            });
        }
    });
    single_project_namespace.init();

    function contactEntered() {
        if (document.getElementById("projectsLeft").textContent != "PROJECTS") {
            c.text(text => 'PROJECTS');
            c.reveal(1000);
        }

        var body = document.getElementsByTagName("BODY")[0];

        b.text(text => '. . / HOME');
        b.reveal(1000);

        const contact_title = baffle(document.getElementById('tommasolaterza'));
        contact_title.set({
            characters: '#@ >   <',
            speed: 100
        });
        contact_title.start();
        contact_title.text(text => 'TOMMASO LATERZA');
        TweenLite.to("#tommasolaterza", 0.5, {
            opacity: 1,
            onComplete: function() {
                contact_title.reveal(1000);
            }
        });

        setImageBackground();
        body.onresize = function() {
            setImageBackground();
        };

        function setImageBackground() {

            var picture = document.getElementById("tommaso");
            var gradient = document.getElementsByClassName("gradient")[0];
            var imagePos = picture.getBoundingClientRect(),
                offsetX = imagePos.left;

            TweenLite.set(gradient, {
                height: picture.height,
                xPercent: 12
            });

            TweenLite.to(gradient, 0.6, {
                width: picture.width,
                zIndex: 1,
                ease: Power2.easeIn,
                onComplete: function() {
                    TweenLite.to(picture, 1, {
                        opacity: 1,
                        zIndex: -1
                    })
                }
            });
        }
    }
});

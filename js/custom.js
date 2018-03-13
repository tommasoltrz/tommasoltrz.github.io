document.addEventListener('DOMContentLoaded', function() {

    var firefox = false;
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        firefox = true;
    }

    // ########## text shuffle ########## //

    var left_nav = document.getElementById('contactsTop');
    var right_nav = document.getElementById('projectsLeft');
    var invertedColours = false;

    var subtext = ["@", "▒", "", "#", "░"];

    const shuffle_left_nav = baffle(document.getElementById('contactsTop'));
    const shuffle_right_nav = baffle(document.getElementById('projectsLeft'));

    shuffle_left_nav.set({
        characters: subtext,
        speed: 100
    });
    shuffle_right_nav.set({
        characters: subtext,
        speed: 100
    });

    left_nav.onmouseover = function() {
        shuffle_left_nav.reveal(1000);
    }
    right_nav.onmouseover = function() {
        shuffle_right_nav.reveal(1000);
    }



    // ########## PAGE TRANSITIONS ########## //

    var lastElementClicked;
    var nav_contacts = document.querySelector('a.conTop');
    var nav_projects = document.querySelector('a.projLeft');
    var nav_single_project = document.querySelector('a.single_project_link');
    var home = document.querySelector('a.home');


    Barba.Prefetch.init();
    Barba.Dispatcher.on('linkClicked', function(el) {
        lastElementClicked = el;
    });

    var MovePage = Barba.BaseTransition.extend({
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
            Barba.HistoryManager.currentStatus().url.split('/').pop();
            return
        }
    });

    Barba.Pjax.getTransition = function() {
        return MovePage;
    };


    var inHome=false;

    // ########## HOME TRANSITIONS ########## /

    var home = Barba.BaseView.extend({
        namespace: 'home',
        onEnterCompleted: function() {
            inHome=true;
            init();
            if (render_started==false){
              render();
            }
            document.getElementById("nav_container").style.backgroundColor = "rgba(0,0,0,0)";
            var loader = document.getElementById('loader');
            if (loader != null) loader.parentNode.removeChild(loader);

            if (left_nav.textContent != "CONTACTS") {
                shuffle_left_nav.text(text => 'CONTACTS');
                shuffle_left_nav.reveal(1000);
            }
            if (right_nav.textContent != "PROJECTS") {
                shuffle_right_nav.text(text => 'PROJECTS');
                shuffle_right_nav.reveal(1000);
            }
            document.getElementsByTagName("BODY")[0].ondblclick = function() {
                    if (!invertedColours && inHome) {
                        invertedColours = true;
                        document.getElementsByTagName("BODY")[0].style.backgroundColor = "#2C353A";
                    } else {
                        invertedColours = false;
                        document.getElementsByTagName("BODY")[0].style.backgroundColor = "white";
                    }
            };
        },
        onLeave: function() {
            explode();
            document.getElementsByTagName("BODY")[0].style.backgroundColor = "white";
            invertedColours = false;
            inHome=false;
        },
        onLeaveCompleted: function() {
            clearInterval(LoadingModels);
        }
    });
    home.init();


    // ########## PROJECTS PAGE TRANSITIONS ########## /

    var projectsPage = Barba.BaseView.extend({
        namespace: 'projectsPage',
        onEnterCompleted: function() {
            document.getElementById("nav_container").style.backgroundColor = "white";

            if (document.getElementById("contactsTop").textContent != "CONTACTS") {
                shuffle_left_nav.text(text => 'CONTACTS');
                shuffle_left_nav.reveal(1000);
            }
            shuffle_right_nav.text(text => '. . / HOME');
            shuffle_right_nav.reveal(1000);


            setTimeout(function() {
                setBackground();
            }, 100);

            var resizeId;
            window.onresize = function() {
                clearTimeout(resizeId);
                resizeId = setTimeout(doneResizing, 500);
            };

            function doneResizing() {
                if (window.innerWidth > 720) setBackground();
            }

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
        },
        onLeaveCompleted: function() {}
    });
    projectsPage.init();

    // ########## CONTACTS TRANSITIONS ########## //

    var contacts = Barba.BaseView.extend({
        namespace: 'contacts',
        onEnterCompleted: function() {
          document.getElementById("nav_container").style.backgroundColor = "white";

            if (right_nav.textContent != "PROJECTS") {
                shuffle_right_nav.text(text => 'PROJECTS');
                shuffle_right_nav.reveal(1000);
            }


            shuffle_left_nav.text(text => '. . / HOME');
            shuffle_left_nav.reveal(1000);

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
            var resizeId;
            window.onresize = function() {
                clearTimeout(resizeId);
                resizeId = setTimeout(doneResizing, 500);
            };

            function doneResizing() {
                if (window.innerWidth > 720) setImageBackground();
            }

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

        },
        onLeave: function() {
            TweenLite.to("#tommaso", 0.5, {
                opacity: 0,
            });
            const contact_title = baffle(document.getElementById('tommasolaterza'));
            contact_title.set({
                characters: '#@>*<',
                speed: 100
            });
            contact_title.start();
            contact_title.text(text => '00');
        }
    });
    contacts.init();

    // ########## SINGLE PROJECT TRANSITIONS ########## //

    var controller;
    var scene;
    var single_project = Barba.BaseView.extend({
        namespace: 'single_project_namespace',
        onEnter: function() {
            window.onbeforeunload = function() {
                window.scrollTo(0, 0);
            }
        },
        onEnterCompleted: function() {
            lightGallery(document.getElementById('lightgallery'));
            document.getElementById("nav_container").style.backgroundColor = "white";

            shuffle_left_nav.text(text => 'PROJECTS');
            shuffle_right_nav.text(text => '. . / HOME');
            shuffle_left_nav.reveal(1000);
            shuffle_right_nav.reveal(1000);

            const shuffle_prev_button = baffle(document.getElementById('prev_btn'));
            var buttonprev = document.getElementById('prev_btn');
            const shuffle_next_button = baffle(document.getElementById('next_btn'));
            var buttonnext = document.getElementById('next_btn');

            shuffle_prev_button.set({
                characters: "PREV",
                speed: 100
            });
            shuffle_next_button.set({
                characters: "PREV",
                speed: 100
            });

            buttonprev.onmouseover = function() {
                shuffle_prev_button.reveal(1000);
            }
            buttonnext.onmouseover = function() {
                shuffle_next_button.reveal(1000);
            }

            var container = document.getElementById("single_project_image_container");
            var image = document.getElementById("single_project_Image");

            if (window.innerWidth >= 720 && !firefox) {
                // init controller
                controller = new ScrollMagic.Controller();

                var tween = TweenLite.to(image, 0.5, {
                    backgroundPositionY: "400px",
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

            function setImageBackground() {

                var image_width;
                var container_width = parseInt(window.getComputedStyle(container).width);
                TweenLite.set(container, {
                    y: 400,
                    height: 0
                });
                TweenLite.set(".single_project_content_row, .video, .btn , .single_project_title, .half-rule, .single_project_img_col", {
                    opacity: 0
                });

                if (window.innerWidth <= 768) {
                    image_width = window.innerWidth;
                    image.style.backgroundSize = image_width + "px";
                } else if (container_width >= 1100) {
                    image_width = 1100;
                    image.style.backgroundSize = image_width + "px";
                    if (!firefox) image.style.backgroundPosition = "50% 110px";
                } else {
                    image_width = container_width;
                    image.style.backgroundSize = image_width + "px";
                    if (!firefox) image.style.backgroundPosition = "50% 110px";
                }

                tweetone = TweenLite.to(container, 1, {
                    height: image_width * 0.56,
                    y: 0,
                    onComplete: function() {
                        TweenLite.to(".single_project_title", 0.5, {
                            opacity: 1,
                            onComplete: function() {
                                TweenLite.to(".single_project_content_row, .video, .btn, .half-rule, .single_project_img_col", 0.5, {
                                    opacity: 1
                                });
                            }
                        })
                    }
                });
            }


        },
        onLeave: function() {
          if (window.innerWidth >= 720 && !firefox) controller = controller.destroy(true);
          var container = document.getElementById("single_project_image_container");
          TweenLite.to(".single_project_content_row, .video, .single_project_img_col, .btn, .half-rule", 0.5, {
              opacity: 0
          });
          TweenLite.to(".single_project_title", 0.5, {
              opacity: 0,
              onComplete: function() {
                  TweenLite.to(container, 0.5, {
                      height: 0,
                      y: 400
                  })
              }
          });
        },
        onLeaveCompleted: function() {}
    });
    single_project.init();



    // ########## INIT TRANSITIONS ########## //

    Barba.Pjax.init();


});

ymaps.ready(init);

function init() {
    let place = [51.00832081225968, 3.628166942264479];
    let map = new ymaps.Map('map', {
        center: place,
        zoom: 10,
    });

    let placeMark = new ymaps.Placemark(place, {}, {
        iconLayout: 'default#image',
        iconImageHref: 'images/icons/placemark.svg',
        iconImageSize: [37, 52],
        iconImageOffset: [-20, -50],
    });

    map.geoObjects.add(placeMark)

    map.controls.remove('geolocationControl'); // удаляем геолокацию
    map.controls.remove('searchControl'); // удаляем поиск
    map.controls.remove('trafficControl'); // удаляем контроль трафика
    map.controls.remove('typeSelector'); // удаляем тип
    map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
    map.controls.remove('zoomControl'); // удаляем контрол зуммирования  
    map.controls.remove('rulerControl'); // удаляем контрол правил
    map.behaviors.disable(['scrollZoom']); // отключаем скролл карты 
}

let reviews = new Swiper(".reviews__slider", {
    autoPlay: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

let atmosphere = new Swiper(".atmosphere__slider", {
    slidesPerView: 1,
    spaceBetween: 10,
    centeredSlides: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    breakpoints: {
        575: {
            slidesPerView: 1.5,
            spaceBetween: 30,
        },
    }
});

// Бургер-меню
let menuBtn = document.querySelector('.menu-btn'),
    menuLine = document.querySelector('.menu-line'),
    menu = document.querySelector('.header__menu'),
    body = document.querySelector('body');

menuBtn.addEventListener('click', function (e) {
    menuLine.classList.toggle('menu-line--active');
    menu.classList.toggle('header__menu--active');
    body.classList.toggle('scroll-lock');
});

// Попапы
const lockPaddingValue = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';  // Получаем размер скроллбара
let lockPaddings = document.querySelectorAll('.lock-padding');   // Элементы с position: fixed

let popups = document.querySelectorAll('.popup'),
    popupLinks = document.querySelectorAll('.popup-link'),
    currentPopup;

function popupOpen(selector) {
    if (currentPopup) {
        currentPopup.classList.remove('open'); // Закрываем открытый попап, если такой есть
    }

    currentPopup = document.querySelector(selector);
    currentPopup.classList.add('open');
    body.classList.add('scroll-lock');  // Отключаем скролл

    // Убираем дёрганье при открытии попапа
    body.style.paddingRight = lockPaddingValue;
    lockPaddings.forEach(function (elem) {
        elem.style.paddingRight = lockPaddingValue;
    });
}

popupLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        let popupSelector = this.getAttribute('href');

        popupOpen(popupSelector);
    });
});


let popupCloses = document.querySelectorAll('.popup-close');

popupCloses.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        if (!e.target.closest('.popup__content') || e.target.closest('.anyway-close')) {
            popups.forEach(function (item) {
                item.classList.remove('open');
            });

            setTimeout(() => {
                body.classList.remove('scroll-lock');

                // Убираем дёрганье при закрытии попапа
                body.style.paddingRight = '0px';
                lockPaddings.forEach(function (elem) {
                    elem.style.paddingRight = '0px';
                });
            }, 400);
        }
    });
});



// Валидация и отправка формы
function validateElem(input) {
    if (input.type == 'email') {
        if (input.value != '' && !validateEmail(input.value)) {
            input.nextElementSibling.textContent = '* Please enter a valid email!';

            return false;
        }
    }

    if (input.type == 'tel') {
        if (input.value != '' && input.inputmask.unmaskedvalue().length < 10) {
            input.nextElementSibling.textContent = '* Please enter a valid number!';

            return false;
        }
    }

    return true;
}

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
}

const forms = document.querySelectorAll('.form'),
    inputPhones = document.querySelectorAll('.input-phone'),
    inputMask = new Inputmask('+7 (999) 999-99-99');

inputPhones.forEach(inputPhone => inputMask.mask(inputPhone));

forms.forEach(function (form) {
    for (let input of form.elements) {
        input.addEventListener('blur', () => validateElem(input));  // Проверяем данные при потере фокуса
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let errors = 0;

        for (let input of form.elements) {
            if (input.tagName != 'BUTTON' && input.type != 'hidden') {
                if (input.value === '') {
                    errors++;
                    input.nextElementSibling.textContent = '* Fill in this field!';
                } else {
                    input.nextElementSibling.textContent = '';
                }

            }

            if (!validateElem(input)) {
                errors++;
            }
        }

        if (errors != 0) {
            return false;
        }


        // Отправка формы
        body.classList.add('overlay');

        let formData = new FormData(form);

        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                body.classList.remove('overlay');

                if (xhr.status === 200) {
                    document.querySelector('.gratitude__title').textContent = 'Your request will be processed soon!';
                    popupOpen('#gratitude');

                } else {
                    document.querySelector('.gratitude__title').textContent = 'Something went wrong!';
                    popupOpen('#gratitude');
                }
            }
        }

        xhr.open('POST', 'mail.php', true);
        xhr.send(formData);

        form.reset();
    });
});
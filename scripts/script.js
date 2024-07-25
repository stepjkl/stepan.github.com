class TextHighlighter {
    constructor() {
        this.originalText = ''
    }

    highlightAndCopyText(event, textElement, highlightElement, temporaryText) {
        if (this.isCopying(event.target)) {
            this.setTemporaryText(textElement, temporaryText)
            this.activateHighlight(highlightElement)
            this.scheduleDeactivation(event, textElement, highlightElement)
        }
    }

    isCopying(target) {
        return target.getAttribute('data-copying') !== ''
    }

    setTemporaryText(textElement, temporaryText) {
        this.originalText = textElement.innerText
        if (temporaryText) {
            textElement.innerText = temporaryText
        }
    }

    restoreOriginalText(event, textElement) {
        if (this.isCopying(event.target)) {
            event.target.removeAttribute('data-copying')
            textElement.innerText = this.originalText
        }
    }

    activateHighlight(highlightElement) {
        highlightElement.classList.add('highlight-text--active')
    }

    deactivateHighlight(highlightElement) {
        highlightElement.classList.remove('highlight-text--active')
    }

    scheduleDeactivation(event, textElement, highlightElement) {
        setTimeout(() => {
            this.restoreOriginalText(event, textElement)
            this.deactivateHighlight(highlightElement)
            setTimeout(() => {
                document.activeElement.blur()
            }, 200)
        }, 1000)
    }
}


class KeyHandler {
    constructor() {
        this.tooltipSelectors = '#menu_links>a[href="#profile"], #menu_links>a[href="#archive"], #menu_button_wrapper'
        this.menuElementSelector = '.animate-fade-in-cta-2'
        this.menuDropdownSelector = '#menu_dropdown'
        this.menuButtonOpenSelector = '#menu_button-open'
        this.menuButtonCloseSelector = '#menu_button-close'

        document.addEventListener('keydown', this.handleKeydown.bind(this))
        document.addEventListener('keyup', this.handleKeyup.bind(this))
    }

    handleKeydown(event) {
        switch (event.keyCode) {
            case 27: // Escape key
                this.clearHash()
                break
            case 80: // P key
                this.toggleProfile(event)
                break
            case 65: // A key
                this.toggleArchive(event)
                break
            case 77: // M key
                this.toggleMenu(event)
                break
            default:
                break
        }

        this.handleTooltipActiveClass(event)
    }

    handleKeyup(event) {
        this.toggleTooltipActiveClass('remove')
    }

    toggleTooltipActiveClass(action) {
        document.querySelectorAll(this.tooltipSelectors).forEach(element => {
            element.classList[action]('tooltip-key--active')
        })
    }

    clearHash() {
        document.location.hash = ''
    }

    toggleProfile(event) {
        event.preventDefault()
        document.location.hash = document.location.hash === '#profile' ? '' : '#profile'
    }

    toggleArchive(event) {
        event.preventDefault()
        document.location.hash = document.location.hash === '#archive' ? '' : '#archive'
    }

    toggleMenu(event) {
        event.preventDefault()
        const menuElement = document.querySelector(this.menuElementSelector)

        if (this.isAnimationFinished(menuElement)) {
            if (document.location.hash === '#menu') {
                this.closeMenu()
            } else {
                this.openMenu()
            }
        }
    }

    isAnimationFinished(element) {
        const animations = element.getAnimations()
        return animations.length === 0 || animations[0].playState === 'finished'
    }

    closeMenu() {
        document.location.hash = ''
        document.querySelector(this.menuDropdownSelector).close()
        document.querySelector(this.menuButtonOpenSelector).focus()
    }

    openMenu() {
        document.location.hash = '#menu'
        document.querySelector(this.menuDropdownSelector).show()
        document.querySelector(this.menuButtonCloseSelector).focus()
    }

    handleTooltipActiveClass(event) {
        if (document.location.hash !== '') {
            this.toggleTooltipActiveClass('remove')
        } else if (event.ctrlKey || event.metaKey) {
            if (document.location.hash === '') {
                this.toggleTooltipActiveClass('add')
            }
        }
    }
}


class WheelHandler {
    constructor() {
        window.addEventListener('wheel', this.handleWheelEvent.bind(this))
    }

    handleWheelEvent(event) {
        const deltaX = Math.abs(event.deltaX)
        const deltaY = Math.abs(event.deltaY)

        if (deltaY > deltaX && deltaY > 5) {
            this.handleVerticalScroll(event.deltaY)
        } else if (deltaX > deltaY && deltaX > 5) {
            this.handleHorizontalScroll(event.deltaX)
        }
    }

    handleVerticalScroll(deltaY) {
        const verticalScrollDirection = deltaY > 0 ? 'down' : 'up'
        const currentHash = window.location.hash

        if (currentHash === '#profile' || currentHash === '#archive') {
            this.handleModalVerticalScroll(verticalScrollDirection, currentHash)
        } else {
            this.handlePageVerticalScroll(verticalScrollDirection)
        }
    }

    handleModalVerticalScroll(verticalScrollDirection, currentHash) {
        const modalElement = document.querySelector(
            currentHash === '#profile' ? '#modal_profile' : '#modal_archive'
        )
        const scrollPositionTop = modalElement.scrollTop

        if (verticalScrollDirection === 'up' && scrollPositionTop === 0) {
            window.location.hash = '#'
        }
    }

    handlePageVerticalScroll(verticalScrollDirection) {
        const scrollPositionY = window.scrollY || window.pageYOffset
        const totalHeight = document.documentElement.scrollHeight

        if (verticalScrollDirection === 'down' && scrollPositionY + window.innerHeight >= totalHeight) {
            if (window.location.hash === '') {
                window.location.hash = '#profile'
            }
        }
    }

    handleHorizontalScroll(deltaX) {
        const horizontalScrollDirection = deltaX > 0 ? 'right' : 'left'
        const scrollPositionX = window.scrollX || window.pageXOffset
        const totalWidth = document.documentElement.scrollWidth

        if (this.isAnimationFinished('.animate-fade-in-cta-2')) {
            if (horizontalScrollDirection === 'right' && scrollPositionX + window.innerWidth >= totalWidth) {
                if (window.location.hash === '') {
                    window.location.hash = '#menu'
                }
            } else if (horizontalScrollDirection === 'left' && scrollPositionX === 0) {
                if (window.location.hash === '#menu') {
                    window.location.hash = '#'
                }
            }
        }
    }

    isAnimationFinished(selector) {
        const animations = document.querySelector(selector).getAnimations()
        return animations.length === 0 || animations[0].playState === 'finished'
    }
}


class TouchHandler {
    constructor() {
        this.touchStartX = 0
        this.touchStartY = 0
        this.init()
    }

    init() {
        window.addEventListener('touchstart', this.handleTouchStart.bind(this))
        window.addEventListener('touchmove', this.handleTouchMove.bind(this))
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX
        this.touchStartY = event.touches[0].clientY
    }

    handleTouchMove(event) {
        const touchEndX = event.touches[0].clientX
        const touchEndY = event.touches[0].clientY
        const deltaX = Math.abs(touchEndX - this.touchStartX)
        const deltaY = Math.abs(touchEndY - this.touchStartY)

        if (deltaY > deltaX && deltaY > 5) {
            this.handleVerticalScroll(touchEndY)
        } else if (deltaX > deltaY && deltaX > 5) {
            this.handleHorizontalScroll(touchEndX)
        }
    }

    handleVerticalScroll(touchEndY) {
        const verticalScrollDirection = touchEndY < this.touchStartY ? 'down' : 'up'
        const currentHash = window.location.hash

        if (currentHash === '#profile' || currentHash === '#archive') {
            this.handleModalScroll(verticalScrollDirection, currentHash)
        } else {
            this.handlePageVerticalScroll(verticalScrollDirection)
        }
    }

    handleModalScroll(verticalScrollDirection, currentHash) {
        const modalElement = document.querySelector(currentHash === '#profile' ? '#modal_profile' : '#modal_archive')
        const scrollPositionTop = modalElement.scrollTop

        if (verticalScrollDirection === 'up' && scrollPositionTop === 0) {
            window.location.hash = '#'
        }
    }

    handlePageVerticalScroll(verticalScrollDirection) {
        const scrollPositionY = window.scrollY || window.pageYOffset
        const totalHeight = document.documentElement.scrollHeight

        if (verticalScrollDirection === 'down' && scrollPositionY + window.innerHeight >= totalHeight) {
            if (window.location.hash === '') {
                window.location.hash = '#profile'
            }
        }
    }

    handleHorizontalScroll(touchEndX) {
        const horizontalScrollDirection = touchEndX > this.touchStartX ? 'right' : 'left'
        const scrollPositionX = window.scrollX
        const totalWidth = document.documentElement.scrollWidth

        if (this.isAnimationFinished('.animate-fade-in-cta-2')) {
            if (horizontalScrollDirection === 'right' && scrollPositionX + window.innerWidth >= totalWidth) {
                if (window.location.hash === '#menu') {
                    window.location.hash = '#'
                }
            } else if (horizontalScrollDirection === 'left' && scrollPositionX === 0) {
                if (window.location.hash === '') {
                    window.location.hash = '#menu'
                }
            }
        }
    }

    isAnimationFinished(selector) {
        const animations = document.querySelector(selector).getAnimations()
        return animations.length === 0 || animations[0].playState === 'finished'
    }
}


class HorizontalDragScroll {
    constructor(options = {}) {
        console.log(options)
        this.element = options.element
        this.options = options
        this.isMouseDown = false
        this.startX = 0
        this.scrollLeft = 0
        this.init()
    }

    init() {
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this))
        this.element.addEventListener('mouseup', this.completeDrag.bind(this))
        this.element.addEventListener('mouseleave', this.completeDrag.bind(this))
        this.element.addEventListener('mousecancel', this.completeDrag.bind(this))
    }

    onMouseDown(event) {
        // if (this.element.classList.contains('edge-x-scroll--scrolling')) return

        this.isMouseDown = true
        this.startX = event.clientX
        this.scrollLeft = this.element.scrollLeft
        this.element.classList.add('x-drag-scroll--mouse-down')
    }

    onMouseMove(event) {
        if (!this.isMouseDown) return

        event.preventDefault()
        /* this.element.setPointerCapture(event.pointerId) */
        this.element.classList.add('x-drag-scroll--dragging')
        const moveX = event.clientX - this.startX
        this.element.scrollLeft = this.scrollLeft - moveX
    }

    completeDrag(event) {
        this.isMouseDown = false

        if (this.options.activeSlide) {
            this.element.scrollTo({
                left: this.options.activeSlide.get().offsetLeft,
                behavior: 'smooth'
            })
        }

        setTimeout(() => {
            this.element.classList.remove('x-drag-scroll--dragging', 'x-drag-scroll--mouse-down')
            /* this.element.releasePointerCapture(event.pointerId) */
        }, 300)
    }
}


class HorizontalEdgeScroller {
    constructor(options = {}) {
        this.options = options
        this.element = this.options.element
        this.maxSpeed = this.options.maxSpeed || 0.75
        this.scrollSpeed = 0
        this.isScrolling = false
        this.lastTimestamp = null
        // this.edgeWidth = (this.options.edgeWidthRatio || 3) * parseFloat(getComputedStyle(document.documentElement).fontSize)
        this.isSnapped = true

        console.log(this.options)
        this.scrollStep = this.scrollStep.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)

        this.init()
    }

    init() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this))
        window.addEventListener('resize', this.onResize.bind(this))
        this.onResize()
    }

    onResize() {
        this.edgeWidth = (this.options.edgeWidthRatio || 3) * parseFloat(getComputedStyle(document.documentElement).fontSize)
        this.setPseudoElementsWidth()
        console.log(this.edgeWidth)
    }

    setPseudoElementsWidth(selector, width) {
        this.element.setAttribute('data-edge-scroll-id', this.options.id) /* parentElement */

        const style = document.createElement('style')
        style.textContent = `
          [data-edge-scroll-id="${this.options.id}"]::before {
            content: '';
            position: absolute;
            z-index: 1;
            display: block;
            inset: 0 auto 0 0;
            width: ${this.edgeWidth}px;
            cursor: w-resize;
          }

          [data-edge-scroll-id="${this.options.id}"]::after {
            content: '';
            position: absolute;
            z-index: 1;
            display: block;
            inset: 0 0 0 auto;
            width: ${this.edgeWidth}px;
            cursor: e-resize;
          }
        `
        document.head.appendChild(style)
    }

    handleMouseOut() {
        this.isSnapped = true

        if (this.options.activeSlide) {
            requestAnimationFrame(() => {
                this.element.scrollTo({
                    left: this.options.activeSlide.get().offsetLeft,
                    behavior: 'smooth'
                })
            })
        }

        setTimeout(() => {
            this.element.classList.remove('edge-x-scroll--scrolling')
        }, 300)
    }

    handleMouseMove(event) {
        if (this.element.classList.contains('x-drag-scroll--dragging')) return

        const rect = this.element.getBoundingClientRect()
        const { clientX, clientY } = event

        const withinXBounds = clientX >= rect.left && clientX <= rect.right
        const withinYBounds = clientY >= rect.top && clientY <= rect.bottom
        const nearLeftEdge = clientX < rect.left + this.edgeWidth
        const nearRightEdge = clientX > rect.right - this.edgeWidth

        if (withinXBounds && withinYBounds) {
            if (nearLeftEdge) {
                this.scrollSpeed = this.calculateSpeed(clientX - rect.left, this.edgeWidth, 'left')
                this.startScroll()
            } else if (nearRightEdge) {
                this.scrollSpeed = this.calculateSpeed(rect.right - clientX, this.edgeWidth, 'right')
                this.startScroll()
            } else {
                if (this.isScrolling) {
                    this.stopScroll()
                }
            }
        } else {
            if (this.isScrolling) {
                this.stopScroll()
            }

            if (!this.isSnapped) {
                this.handleMouseOut()
            }
        }
    }

    startScroll() {
        if (!this.isScrolling) {
            this.isScrolling = true
            // if (this.options.activeSlide) {
                this.isSnapped = false
            // }
            this.element.classList.add('edge-x-scroll--scrolling')
            requestAnimationFrame(this.scrollStep)
        }
    }

    scrollStep(timestamp) {
        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp
        }
        const elapsed = timestamp - this.lastTimestamp
        this.lastTimestamp = timestamp

        const maxScrollLeft = this.element.scrollWidth - this.element.clientWidth
        const minScrollLeft = 0

        this.element.scrollLeft += this.scrollSpeed * elapsed

        if (this.scrollSpeed !== 0) {
            requestAnimationFrame(this.scrollStep)
        } else {
            this.isScrolling = false
            this.lastTimestamp = null
        }
    }

    stopScroll() {
        this.scrollSpeed = 0
    }

    calculateSpeed(distance, edgeWidth, direction) {
        const speed = (this.maxSpeed * (edgeWidth - distance)) / edgeWidth
        return direction === 'left' ? -speed : speed
    }
}


class Popup {
    constructor() {
        this.widthRatio = 0.8
        this.heightRatio = 0.8
    }

    open(element, event) {
        event.preventDefault()

        const { href } = element

        const width = screen.availWidth * this.widthRatio
        const height = screen.availHeight * this.heightRatio
        const left = (screen.availWidth - width) / 2
        const top = (screen.availHeight - height) / 2

        const popup = window.open(href, '_blank', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`)

        if (popup === null) {
            return true
        }
        return false
    }
}


class Carousel {
    constructor(options = {}) {
        console.log(options)
        this.options = options
        this.carouselEl = options.element
        this.slidesWrapperEl = this.carouselEl.querySelector('[data-carousel-slides]')
        this.slideEls = Array.from(this.carouselEl.querySelectorAll('[data-carousel-slides] figure'))
        this.navEl = this.carouselEl.querySelector('[data-carousel-nav]')
        this.dotEls = []
        this.prevButtonEl = this.carouselEl.querySelector('[data-carousel-arrows] li:first-child button')
        this.nextButtonEl = this.carouselEl.querySelector('[data-carousel-arrows] li:last-child button')
        this.activeSlide = {
            element: null,
            get: () => this.activeSlide.element,
            set: (el) => this.activeSlide.element = el
        }

        this.init()
    }

    init() {
        this.createNavigationDots()
        this.setupIntersectionObserver()
        this.enableHorizontalDragScroll()
        this.enableHorizontalEdgeScroller()
        this.setupDotEventListeners()
        this.setupButtonEventListeners()
    }

    createNavigationDots() {
        this.navEl.innerHTML = this.slideEls.map((_, index) => `<button data-label-for="${this.slideEls[index].getAttribute('data-value')}"><span class="sr-only">Slide ${index + 1}</span></button>`).join('')
        this.dotEls = Array.from(this.navEl.querySelectorAll('button'))
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const target = entry.target
                if (entry.isIntersecting) {
                    this.activeSlide.set(target)
                    target.classList.add('active')
                    this.dotEls.forEach((dotEl, i) => {
                        const isCurrent = i === this.slideEls.indexOf(entry.target)
                        dotEl.toggleAttribute('aria-current', isCurrent)

                        if (isCurrent) {
                            dotEl.focus()
                        }
                    })
                } else {
                    target.classList.remove('active')
                }
            })
        }, {
            root: this.carouselEl,
            rootMargin: `0% -50% 0% -${window.getComputedStyle(this.slidesWrapperEl).getPropertyValue('column-gap')}`,
            threshold: 0.5
        })

        this.slideEls.forEach(itemEl => observer.observe(itemEl))
    }

    setupDotEventListeners() {
        this.dotEls.forEach(dotEl => {
            dotEl.addEventListener('click', event => {
                event.preventDefault()
                const targetValue = event.target.getAttribute('data-label-for')
                this.carouselEl.querySelector(`figure[data-value="${targetValue}"]`).scrollIntoView({
                    behavior: 'smooth', block: 'nearest', inline: 'start'
                })
            })
        })
    }

    enableHorizontalDragScroll() {
        new HorizontalDragScroll({ element: this.slidesWrapperEl, activeSlide: this.activeSlide })
    }

    enableHorizontalEdgeScroller() {
        new HorizontalEdgeScroller({ id: this.options.id, element: this.slidesWrapperEl, maxSpeed: 1, edgeWidthRatio: 5, activeSlide: this.activeSlide })
    }

    setupButtonEventListeners() {
        this.prevButtonEl.addEventListener('click', (event) => {
            event.preventDefault()
            this.activeSlide.get().previousElementSibling.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            })
        })

        this.nextButtonEl.addEventListener('click', (event) => {
            event.preventDefault()
            this.activeSlide.get().nextElementSibling.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            })
        })
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI elements based on the current hash
    if (window.location.hash) {
        document.querySelectorAll(
            '.animate-fade-in-name span, .animate-fade-in-title span, .animate-fade-in-cta-1, .animate-fade-in-cta-2, .animate-fade-in-logo'
        ).forEach(element => {
            element.classList.add('noanimation')
        })
        document.querySelector('#menu_dropdown').show()
    }

    // Initialize handlers
    new WheelHandler()
    new TouchHandler()
    new KeyHandler()

    // Initialize text highlighter
    window.textHighlighter = new TextHighlighter()

    // Initialize carousels
    document.querySelectorAll('[data-carousel]').forEach((carouselEl, index) => new Carousel({ id: `carousel-${index + 1}`, element: carouselEl }))

    // Initialize popups
    document.querySelectorAll('[data-carousel-slides] figure a').forEach(element => {
        element.addEventListener('click', event => new Popup().open(element, event))
    })

    // Initialize edge scroller
    new HorizontalEdgeScroller({ id: 'timeline', element: document.querySelector('#timeline_content') })
    new HorizontalDragScroll({ element: document.querySelector('#timeline_content') })
    /* document.querySelectorAll('[data-carousel-slides]').forEach(element => {
        new HorizontalEdgeScroller({ edgeWidthRatio: 5 }).init(element)
    }) */
})
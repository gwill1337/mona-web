export const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const targetId = href.replace("#", "");
            const element = document.getElementById(targetId);

            if (element) {
                const isMobile = window.innerWidth < 768;
                const isTall = element.clientHeight > window.innerHeight * 0.8;

                if (isMobile || isTall) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                } else {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }

                window.history.pushState(null, "", href)
            }
        }
    };
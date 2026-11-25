const destination=new URL(location.href);destination.pathname=destination.pathname.replace(/^\/preview(?=\/|$)/,'')||'/';location.replace(destination.href);

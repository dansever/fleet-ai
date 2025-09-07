import logging

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the given name.
    - name: The name of the logger.
    - Returns: A logger object with format: 
    [ time | name | level | filename:line_number | message ]
    """
    logger = logging.getLogger(name)    
    logger.propagate = False  # Prevent logs from bubbling up to root logger
    
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s | %(name)s | %(levelname)s | %(filename)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S' # Format date as YYYY-MM-DD HH:MM:SS
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger
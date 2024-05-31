import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler = logging.FileHandler('../logs/database_errors.log')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

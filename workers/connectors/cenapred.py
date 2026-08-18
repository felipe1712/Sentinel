import httpx
import logging

logger = logging.getLogger(__name__)

async fn_fetch_cenapred_earthquakes():
    url = "https://api.rss2json.com/v1/api.json?rss_url=http://www.ssn.unam.mx/rss/ultimos-sismos.xml"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                logger.info("CENAPRED RSS obtenido correctamente")
                return resp.json().get("items", [])
        except Exception as e:
            logger.warning(f"Error consultando sismológico: {e}")
    return []

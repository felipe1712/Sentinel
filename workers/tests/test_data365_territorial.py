"""
Unit Tests for Data365 Territorial Social Media & GDELT Engine (SentinelIQ v2)
==============================================================================
Pruebas unitarias completas para:
1. Geocodificación y mapeo territorial multi-estado (Querétaro, Guanajuato, Puebla).
2. Generación e idempotencia del hash de deduplicación SHA-256 (`dedup_hash`).
3. Normalización del modelo de datos de eventos para `events`.
4. Comportamiento del Circuit Breaker (CLOSED -> OPEN -> HALF_OPEN).
5. Jerarquía de excepciones tipadas.
"""

import os
import sys
import unittest
import time
from unittest.mock import patch, MagicMock

# Agregar path del directorio de workers
workers_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if workers_dir not in sys.path:
    sys.path.insert(0, workers_dir)

from data365_client import (
    Data365Client,
    geocode_territory,
    generate_dedup_hash,
    Data365APIError,
    Data365TimeoutError,
    Data365RateLimitError,
    Data365EmptyResponseError,
    MUNICIPALITIES_QRO,
    MUNICIPALITIES_GTO,
    MUNICIPALITIES_PUE,
)
from mcp_client import CircuitBreaker, CircuitState


class TestTerritorialGeocoding(unittest.TestCase):
    """Pruebas para el geocodificador territorial de Querétaro, Guanajuato y Puebla."""

    def test_geocoding_queretaro_municipalities(self):
        # San Juan del Río
        nombre, lat, lng, clave = geocode_territory("Fuerte choque en autopista 57 tramo San Juan del Río", state_key="qro")
        self.assertEqual(nombre, "San Juan del Río")
        self.assertAlmostEqual(lat, 20.3872, places=3)
        self.assertAlmostEqual(lng, -99.9961, places=3)
        self.assertEqual(clave, "22016")

        # El Marqués (sin acento)
        nombre, lat, lng, clave = geocode_territory("Monitoreo preventivo de drenes en El Marques", state_key="qro")
        self.assertEqual(nombre, "El Marqués")
        self.assertEqual(clave, "22011")

        # Corregidora
        nombre, lat, lng, clave = geocode_territory("Operativo interinstitucional de patrullaje en Corregidora", state_key="qro")
        self.assertEqual(nombre, "Corregidora")
        self.assertEqual(clave, "22006")

    def test_geocoding_guanajuato_municipalities(self):
        # Celaya
        nombre, lat, lng, clave = geocode_territory("Despliegue operativo FSPE en zona poniente de Celaya", state_key="gto")
        self.assertEqual(nombre, "Celaya")
        self.assertAlmostEqual(lat, 20.5280, places=3)
        self.assertAlmostEqual(lng, -100.8150, places=3)
        self.assertEqual(clave, "11007")

        # León
        nombre, lat, lng, clave = geocode_territory("Cierre parcial en bulevar Adolfo López Mateos en Leon", state_key="gto")
        self.assertEqual(nombre, "León")
        self.assertEqual(clave, "11020")

        # Irapuato
        nombre, lat, lng, clave = geocode_territory("Atención de emergencia vial en Irapuato", state_key="gto")
        self.assertEqual(nombre, "Irapuato")
        self.assertEqual(clave, "11017")

    def test_geocoding_puebla_municipalities(self):
        # Puebla Capital
        nombre, lat, lng, clave = geocode_territory("Operativo de vigilancia en el Centro Histórico de Puebla Capital", state_key="pue")
        self.assertEqual(nombre, "Puebla Capital")
        self.assertAlmostEqual(lat, 19.0414, places=3)
        self.assertAlmostEqual(lng, -98.2063, places=3)
        self.assertEqual(clave, "21114")

        # Tehuacán
        nombre, lat, lng, clave = geocode_territory("Protección civil atiende llamado comunitario en Tehuacán", state_key="pue")
        self.assertEqual(nombre, "Tehuacán")
        self.assertEqual(clave, "21156")

        # San Martín Texmelucan
        nombre, lat, lng, clave = geocode_territory("Tránsito denso en caseta San Martin Texmelucan", state_key="pue")
        self.assertEqual(nombre, "San Martín Texmelucan")
        self.assertEqual(clave, "21132")

    def test_geocoding_fallback_to_centroid(self):
        # Texto sin municipio explícito en Querétaro
        nombre, lat, lng, clave = geocode_territory("Reporte general estatal de clima", state_key="qro")
        self.assertEqual(nombre, "Santiago de Querétaro")
        self.assertIsNone(clave)

        # Texto sin municipio en Puebla
        nombre, lat, lng, clave = geocode_territory("Boletín meteorológico regional", state_key="pue")
        self.assertEqual(nombre, "Puebla Capital")
        self.assertIsNone(clave)


class TestDeduplicationHash(unittest.TestCase):
    """Pruebas para la generación determinista e idempotente del hash SHA-256."""

    def test_dedup_hash_reproducibility(self):
        url = "https://x.com/AlertasVialesQro/status/1892837465"
        hash1 = generate_dedup_hash("data365_twitter", url)
        hash2 = generate_dedup_hash("data365_twitter", url)
        self.assertEqual(hash1, hash2)
        self.assertEqual(len(hash1), 64)

    def test_dedup_hash_distinction(self):
        url1 = "https://x.com/AlertasVialesQro/status/1892837465"
        url2 = "https://x.com/AlertasVialesQro/status/1892837466"
        hash1 = generate_dedup_hash("data365_twitter", url1)
        hash2 = generate_dedup_hash("data365_twitter", url2)
        self.assertNotEqual(hash1, hash2)

    def test_dedup_hash_across_platforms(self):
        native_id = "post_12345"
        hash_tw = generate_dedup_hash("data365_twitter", native_id)
        hash_fb = generate_dedup_hash("data365_facebook", native_id)
        self.assertNotEqual(hash_tw, hash_fb)


class TestPostNormalization(unittest.TestCase):
    """Pruebas de normalización hacia el esquema de eventos."""

    def setUp(self):
        self.client = Data365Client(api_key="mock_key")

    def test_normalize_twitter_post_qro(self):
        raw = {
            "id": "1899990001",
            "text": "ALERTA: Fuerte choque múltiple y volcadura en autopista 57 pasando San Juan del Río. Se solicita ambulancia.",
            "url": "https://x.com/AlertaQro/status/1899990001",
            "user": {"username": "AlertaQro", "name": "Alerta Vial Qro"},
            "created_time": "2026-09-16T12:00:00Z",
            "likes_count": 45,
            "shares_count": 12,
        }
        event = self.client.normalize_post(raw, platform="twitter", target_state="qro")

        self.assertIn("[TWITTER]", event["title"])
        self.assertEqual(event["municipio"], "San Juan del Río")
        self.assertEqual(event["category"], "seguridad")
        self.assertIn(event["severity"], ("alto", "critico"))
        self.assertTrue(0 <= event["political_relevance"] <= 10)
        self.assertEqual(event["source_type"], "data365_twitter")
        self.assertTrue(len(event["dedup_hash"]) == 64)
        self.assertEqual(event["entities"]["autor"], "@AlertaQro")
        self.assertEqual(event["entities"]["municipio_clave"], "22016")

    def test_normalize_facebook_post_gto(self):
        raw = {
            "id": "fb_8888",
            "text": "Despliegue de unidades de seguridad en colonias del norte de Celaya. Patrullaje FSPE continuo.",
            "url": "https://facebook.com/SeguridadGto/posts/8888",
            "user": {"username": "SeguridadGto", "name": "Seguridad GTO"},
            "created_time": "2026-09-16T14:30:00Z",
        }
        event = self.client.normalize_post(raw, platform="facebook", target_state="gto")

        self.assertEqual(event["municipio"], "Celaya")
        self.assertEqual(event["category"], "seguridad")
        self.assertEqual(event["source_type"], "data365_facebook")
        self.assertAlmostEqual(event["lat"], 20.5280, places=3)
        self.assertAlmostEqual(event["lng"], -100.8150, places=3)


class TestCircuitBreaker(unittest.TestCase):
    """Pruebas para el patrón Circuit Breaker de fuentes externas."""

    def test_circuit_breaker_transitions(self):
        cb = CircuitBreaker("TEST_CIRCUIT", failure_threshold=2, recovery_timeout_sec=0.1)
        self.assertEqual(cb.state, CircuitState.CLOSED)
        self.assertTrue(cb.can_execute())

        # Primer fallo (no abre aún)
        cb.record_failure(Exception("Timeout 1"))
        self.assertEqual(cb.state, CircuitState.CLOSED)
        self.assertEqual(cb.failure_count, 1)

        # Segundo fallo (supera umbral -> OPEN)
        cb.record_failure(Exception("Timeout 2"))
        self.assertEqual(cb.state, CircuitState.OPEN)
        self.assertFalse(cb.can_execute())

        # Simular transcurso de tiempo de recuperación
        time.sleep(0.15)
        # Debe permitir ejecución en HALF_OPEN
        self.assertTrue(cb.can_execute())
        self.assertEqual(cb.state, CircuitState.HALF_OPEN)

        # Éxito en HALF_OPEN restaura a CLOSED
        cb.record_success()
        self.assertEqual(cb.state, CircuitState.CLOSED)
        self.assertEqual(cb.failure_count, 0)


class TestExceptionHierarchy(unittest.TestCase):
    """Prueba la jerarquía de excepciones tipadas."""

    def test_exceptions_inheritance(self):
        self.assertTrue(issubclass(Data365TimeoutError, Data365APIError))
        self.assertTrue(issubclass(Data365RateLimitError, Data365APIError))
        self.assertTrue(issubclass(Data365EmptyResponseError, Data365APIError))

        err = Data365RateLimitError("Quota limit", status_code=429)
        self.assertEqual(err.status_code, 429)
        self.assertIsInstance(err, Data365APIError)


if __name__ == "__main__":
    unittest.main()

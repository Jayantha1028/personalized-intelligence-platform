"""
Developer Security Advisories & CVE Radar API
=============================================
Uses common_integrations.security and k8s-cve-intelligence-service to provide
real-time, offline-capable developer vulnerability intelligence, container CVEs,
and CIS benchmark misconfiguration signatures.
"""
from typing import Any, Dict, List, Optional
import json
import sys
from pathlib import Path
from fastapi import APIRouter, Query
from pydantic import BaseModel

# Ensure collected_microservices is importable
_COLLECTED_DIR = Path(__file__).resolve().parents[3] / "collected_microservices"
if _COLLECTED_DIR.exists() and str(_COLLECTED_DIR) not in sys.path:
    sys.path.insert(0, str(_COLLECTED_DIR))

try:
    from common_integrations import (
        lookup_cve,
        TAXONOMY_SIGNATURES,
    )
except ImportError:
    TAXONOMY_SIGNATURES = {
        "V01": {"name": "Privileged Container Execution", "severity": "CRITICAL", "standard": "CIS 5.2.1", "remediation": "Set securityContext.privileged: false"},
        "V02": {"name": "Root User Execution (UID 0)", "severity": "HIGH", "standard": "CIS 5.2.6", "remediation": "Set securityContext.runAsNonRoot: true"},
        "V03": {"name": "Host Network Namespace Sharing", "severity": "HIGH", "standard": "CIS 5.2.4", "remediation": "Set hostNetwork: false"},
        "V05": {"name": "Dangerous Kernel Capabilities (SYS_ADMIN)", "severity": "CRITICAL", "standard": "CIS 5.2.8", "remediation": "Drop CAP_SYS_ADMIN and drop ALL"},
        "V18": {"name": "Plaintext Secrets in Environment Variables", "severity": "HIGH", "standard": "CIS 5.4.1", "remediation": "Use SecretKeyRef instead of plaintext value"}
    }
    def lookup_cve(image_tag: str) -> List[Dict[str, Any]]:
        return []

router = APIRouter(prefix="/security", tags=["Developer Security Advisories"])

# Load comprehensive CVE database if available
CVE_DB_PATH = _COLLECTED_DIR / "k8s-cve-intelligence-service" / "cve_database.json"
_ALL_CVES: List[Dict[str, Any]] = []

if CVE_DB_PATH.exists():
    try:
        with open(CVE_DB_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            for image, cves in data.items():
                for c in cves:
                    entry = dict(c)
                    entry["target_image"] = image
                    _ALL_CVES.append(entry)
    except Exception as e:
        print(f"Warning: could not load cve_database.json: {e}")

# Fallback baseline entries if DB missing or small
if not _ALL_CVES:
    _ALL_CVES = [
        {
            "cve_id": "CVE-2021-3177",
            "target_image": "python:3.8",
            "package": "python3",
            "severity": "CRITICAL",
            "cvss": 9.8,
            "description": "Buffer overflow in PyCArg_repr in _ctypes/callproc.c allowing arbitrary remote code execution.",
            "fixed_in": "3.8.8",
            "remediation": "Upgrade Python base image to 3.11+ or 3.8.8-slim."
        },
        {
            "cve_id": "CVE-2021-22918",
            "target_image": "node:14",
            "package": "node",
            "severity": "HIGH",
            "cvss": 7.5,
            "description": "Out-of-bounds read in libuv's uv__idna_toascii function used by Node.js DNS resolver.",
            "fixed_in": "14.17.1",
            "remediation": "Pin Node.js image to >=18-alpine or >=20-bookworm."
        },
        {
            "cve_id": "CVE-2020-27350",
            "target_image": "debian:9",
            "package": "apt",
            "severity": "MEDIUM",
            "cvss": 5.7,
            "description": "Integer overflow in apt package verification allowing bypass of signature validation.",
            "fixed_in": "1.4.11",
            "remediation": "Run 'apt-get update && apt-get upgrade -y apt' in container build."
        },
        {
            "cve_id": "CVE-2023-44487",
            "target_image": "nginx:1.24",
            "package": "http2",
            "severity": "HIGH",
            "cvss": 7.5,
            "description": "HTTP/2 Rapid Reset distributed denial of service attack exploiting stream cancellation.",
            "fixed_in": "1.25.3",
            "remediation": "Set keepalive_requests and limit_conn in NGINX configuration."
        }
    ]


@router.get("/advisories")
def get_security_advisories(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    keyword: Optional[str] = Query(None, description="Filter by package or description keyword"),
    min_cvss: Optional[float] = Query(0.0, ge=0.0, le=10.0),
    limit: int = Query(30, ge=1, le=200)
) -> Dict[str, Any]:
    """Retrieve security advisories affecting developer packages and container images."""
    results = _ALL_CVES

    if severity:
        results = [c for c in results if str(c.get("severity", "")).upper() == severity.upper().strip()]
    if min_cvss:
        results = [c for c in results if float(c.get("cvss", 0.0)) >= min_cvss]
    if keyword:
        kw = keyword.lower().strip()
        results = [
            c for c in results
            if kw in str(c.get("cve_id", "")).lower()
            or kw in str(c.get("package", "")).lower()
            or kw in str(c.get("description", "")).lower()
            or kw in str(c.get("target_image", "")).lower()
        ]

    # Calculate summary stats
    crit_count = sum(1 for c in _ALL_CVES if str(c.get("severity")).upper() == "CRITICAL")
    high_count = sum(1 for c in _ALL_CVES if str(c.get("severity")).upper() == "HIGH")
    med_count = sum(1 for c in _ALL_CVES if str(c.get("severity")).upper() == "MEDIUM")

    return {
        "total_matched": len(results),
        "summary": {
            "critical_count": crit_count,
            "high_count": high_count,
            "medium_count": med_count,
            "total_tracked": len(_ALL_CVES)
        },
        "advisories": results[:limit]
    }


@router.get("/signatures")
def get_security_signatures() -> Dict[str, Any]:
    """Return standard CIS Benchmark security violation signatures and mitigations."""
    return {
        "standard": "CIS Kubernetes Benchmark v1.6.0 & MITRE ATT&CK Cloud",
        "total_signatures": len(TAXONOMY_SIGNATURES),
        "signatures": TAXONOMY_SIGNATURES
    }

function perfWrapper ({blocks}) {
    return {
        "schema": {
            "structure": "flat",
            "structure_version": "0.2.1",
            "constraints": [
                {
                    "name": "perf",
                    "version": "0.2.1"
                }
            ]
        },
        "metadata": {
            "translation": {
                "id": "dcs/en_ust",
                "selectors": {
                    "org": "dcs",
                    "lang": "en",
                    "abbr": "ust"
                },
                "properties": {},
                "tags": []
            },
            "document": {
                "id": "TIT EN_UST en_English_ltr Wed Jun 30 2021 14:06:22 GMT-0400 (Eastern Daylight Time) tc",
                "bookCode": "TIT",
                "usfm": "3.0",
                "ide": "UTF-8",
                "h": "Titus",
                "toc": "The Letter of Paul to Titus",
                "toc2": "Titus",
                "toc3": "Tit",
                "properties": {},
                "tags": []
            }
        },
        "sequences": {
            "ODE5OGJjM2Et": {
                "type": "main",
                "blocks": blocks
            },
        },
        "main_sequence_id": "ODE5OGJjM2Et"
    }
}

export default perfWrapper;
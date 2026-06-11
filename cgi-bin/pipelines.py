import re

PIPELINE_NAMES = {
    'chipseq':              'ChipSeq',
    'chipseq1':             'ChipSeq',
    'dnaseq':               'DnaSeq',
    'episeq':               'EpiSeq',
    'pacbioassembly':       'PacBioAssembly',
    'rnaseq':               'RnaSeq',
    'covseq':               'CoVSeq',
    'rnaseqdenovoassembly': 'RnaSeqDeNovoAssembly',
}

def normalize_pipeline(name):
    return PIPELINE_NAMES.get(name.lower(), name)

def split_pipeline_version(raw):
    """Split old-format 'pipelineName-X.Y[-suffix]' into (base, version).
    Returns (raw, None) when no embedded version pattern is found."""
    m = re.search(r'-(\d+\..*)$', raw)
    if m:
        return raw[:m.start()], m.group(1)
    return raw, None

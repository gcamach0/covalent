const result = {
  dispatch_id: '1997f5cf-0b35-4299-abad-a381a1f79387',
  status: 'FAILED',
  result: null,
  start_time: '2022-02-02T12:06:18.600827+00:00',
  end_time: '2022-02-02T12:06:19.387529+00:00',
  results_dir: '/home/valentin/code/agnostiq/examples/results',
  lattice: {
    function_string:
      '# @ct.lattice\ndef final_calc(\n    target_list=["sirius", "trappist-1"],\n    region="America/Los_Angeles",\n    latitude=49.2827,\n    longitude=-123.1207,\n):\n    RA = get_RA(target_list=target_list)\n    dec = get_dec(target_list=target_list)\n    T = convert_to_utc(time_zone=region)\n    d = days_since_J2000(region=region)\n    lst = local_sidereal_time(d=d, long=longitude, T=T)\n    ha = hour_angle(LST=lst, RA=RA)\n    alt = altitude_of_target(dec=dec, lat=latitude, ha=ha)\n    az = get_azimuth(dec=dec, lat=latitude, ha=ha, alt=alt)\n    return alt, az\n\n\n',
    doc: null,
    name: 'final_calc',
    kwargs: {},
    metadata: {
      backend: 'local',
      dispatcher: '0.0.0.0:48008',
      results_dir: '/home/valentin/code/agnostiq/examples/results',
      executor: {
        log_stdout: 'stdout.log',
        log_stderr: 'stderr.log',
        conda_env: '',
        cache_dir: '/tmp/covalent',
        current_env_on_conda_fail: 'False',
        current_env: '',
      },
    },
  },
  graph: {
    nodes: [
      {
        name: 'get_RA',
        kwargs: { target_list: "['sirius', 'trappist-1']" },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef get_RA(target_list):\n    RA = []\n    for target_name in target_list:\n        response = requests.get(\n            "http://simbad.u-strasbg.fr/simbad/sim-id?output.format=votable&Ident=%s&output.params=ra,dec"\n            % target_name\n        )\n        star_info = response.text\n        RA.append(\n            star_info[star_info.index("<TR><TD>") + 8 : star_info.index("</TD><TD>")]\n        )\n    RA_degs = []\n    for source in RA:\n        hour = float(source.split(" ")[0])\n        minute = float(source.split(" ")[1])\n        second = float(source.split(" ")[2])\n        RA_degs.append(((hour + minute / 60 + second / 3600) * 15))\n    return RA_degs\n\n\n',
        start_time: '2022-02-02T12:06:18.822333+00:00',
        end_time: '2022-02-02T12:06:19.131980+00:00',
        status: 'FAILED',
        output: null,
        error: 'substring not found',
        sublattice_result: null,
        stdout: null,
        stderr: null,
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 0,
        doc: null,
      },
      {
        name: ':electron_list:',
        kwargs: { target_list: "['sirius', 'trappist-1']" },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string: '# to_electron_collection was not inspectable\n\n',
        start_time: '2022-02-02T12:06:18.619317+00:00',
        end_time: '2022-02-02T12:06:18.705073+00:00',
        status: 'COMPLETED',
        output: ['sirius', 'trappist-1'],
        error: null,
        sublattice_result: null,
        stdout: '',
        stderr: '',
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 1,
        doc: null,
      },
      {
        name: ':parameter:sirius',
        kwargs: { target_list: 'sirius' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601042+00:00',
        end_time: '2022-02-02T12:06:18.601048+00:00',
        status: 'COMPLETED',
        output: 'sirius',
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 2,
        doc: null,
      },
      {
        name: ':parameter:trappist-1',
        kwargs: { target_list: 'trappist-1' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601074+00:00',
        end_time: '2022-02-02T12:06:18.601079+00:00',
        status: 'COMPLETED',
        output: 'trappist-1',
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 3,
        doc: null,
      },
      {
        name: 'get_dec',
        kwargs: { target_list: "['sirius', 'trappist-1']" },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef get_dec(target_list):\n    dec = []\n    for target_name in target_list:\n        response = requests.get(\n            "http://simbad.u-strasbg.fr/simbad/sim-id?output.format=votable&Ident=%s&output.params=ra,dec"\n            % target_name\n        )\n        star_info = response.text\n        dec.append(\n            star_info[star_info.index("</TD><TD>") + 9 : star_info.index("</TD></TR>")]\n        )\n    dec_degs = []\n    for source in dec:\n        degree = float(source.split(" ")[0])\n        arcmin = float(source.split(" ")[1])\n        arcsec = float(source.split(" ")[2])\n        if degree < 0:\n            dec_degs.append(degree - arcmin / 60 - arcsec / 3600)\n        else:\n            dec_degs.append(degree + arcmin / 60 + arcsec / 3600)\n    return dec_degs\n\n\n',
        start_time: '2022-02-02T12:06:18.823300+00:00',
        end_time: '2022-02-02T12:06:19.330697+00:00',
        status: 'COMPLETED',
        output: [-16.71611586111111, -5.041399250518333],
        error: null,
        sublattice_result: null,
        stdout: '',
        stderr: '',
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 4,
        doc: null,
      },
      {
        name: ':electron_list:',
        kwargs: { target_list: "['sirius', 'trappist-1']" },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string: '# to_electron_collection was not inspectable\n\n',
        start_time: '2022-02-02T12:06:18.611961+00:00',
        end_time: '2022-02-02T12:06:18.716573+00:00',
        status: 'COMPLETED',
        output: ['sirius', 'trappist-1'],
        error: null,
        sublattice_result: null,
        stdout: '',
        stderr: '',
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 5,
        doc: null,
      },
      {
        name: ':parameter:sirius',
        kwargs: { target_list: 'sirius' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601100+00:00',
        end_time: '2022-02-02T12:06:18.601105+00:00',
        status: 'COMPLETED',
        output: 'sirius',
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 6,
        doc: null,
      },
      {
        name: ':parameter:trappist-1',
        kwargs: { target_list: 'trappist-1' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601126+00:00',
        end_time: '2022-02-02T12:06:18.601131+00:00',
        status: 'COMPLETED',
        output: 'trappist-1',
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 7,
        doc: null,
      },
      {
        name: 'convert_to_utc',
        kwargs: { time_zone: 'America/Los_Angeles' },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef convert_to_utc(time_zone):\n    start_time = 0\n    end_time = 24.016\n    now = datetime.now(pytz.timezone(time_zone))\n    offset = now.utcoffset().total_seconds() / 60 / 60\n    utc_timerange = np.arange(start_time - offset, end_time - offset, 0.016)\n    return utc_timerange\n\n\n',
        start_time: '2022-02-02T12:06:18.651875+00:00',
        end_time: '2022-02-02T12:06:18.743136+00:00',
        status: 'COMPLETED',
        output: '[ 8.     8.016  8.032 ... 31.968 31.984 32.   ]',
        error: null,
        sublattice_result: null,
        stdout: '',
        stderr: '',
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 8,
        doc: null,
      },
      {
        name: ':parameter:America/Los_Angeles',
        kwargs: { time_zone: 'America/Los_Angeles' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601151+00:00',
        end_time: '2022-02-02T12:06:18.601157+00:00',
        status: 'COMPLETED',
        output: 'America/Los_Angeles',
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 9,
        doc: null,
      },
      {
        name: 'days_since_J2000',
        kwargs: { region: 'America/Los_Angeles' },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef days_since_J2000(region):\n    f_date = date(2000, 1, 1)\n    year = get_date(time_zone=region)[0]\n    month = get_date(time_zone=region)[1]\n    day = get_date(time_zone=region)[2]\n    l_date = date(year, month, day)\n    delta = l_date - f_date\n    return delta.days\n\n\n',
        start_time: '2022-02-02T12:06:18.640719+00:00',
        end_time: '2022-02-02T12:06:18.738933+00:00',
        status: 'COMPLETED',
        output: 8068,
        error: null,
        sublattice_result: null,
        stdout: '',
        stderr: '',
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 10,
        doc: null,
      },
      {
        name: ':parameter:America/Los_Angeles',
        kwargs: { region: 'America/Los_Angeles' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601177+00:00',
        end_time: '2022-02-02T12:06:18.601182+00:00',
        status: 'COMPLETED',
        output: 'America/Los_Angeles',
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 11,
        doc: null,
      },
      {
        name: 'local_sidereal_time',
        kwargs: {
          d: '8068',
          long: '-123.1207',
          T: '[ 8.     8.016  8.032 ... 31.968 31.984 32.   ]',
        },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef local_sidereal_time(d, long, T):\n    LST = 100.46 + 0.985647 * (d + T / 24) + long + 15 * T\n    return LST\n\n\n',
        start_time: '2022-02-02T12:06:18.829385+00:00',
        end_time: '2022-02-02T12:06:18.923572+00:00',
        status: 'COMPLETED',
        output:
          '[8049.867845  8050.1085021 8050.3491592 ... 8410.3721778 8410.6128349\n 8410.853492 ]',
        error: null,
        sublattice_result: null,
        stdout: '',
        stderr: '',
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 12,
        doc: null,
      },
      {
        name: ':parameter:-123.1207',
        kwargs: { long: '-123.1207' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601202+00:00',
        end_time: '2022-02-02T12:06:18.601207+00:00',
        status: 'COMPLETED',
        output: -123.1207,
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 13,
        doc: null,
      },
      {
        name: 'hour_angle',
        kwargs: {
          LST: '<covalent._workflow.electron.Electron object at 0x7f5e8258f1c0>',
          RA: '<covalent._workflow.electron.Electron object at 0x7f5e61fa19a0>',
        },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef hour_angle(LST, RA):\n    LST_list = []\n    for source in RA:\n        LST_list.append(np.asarray([value - source for value in LST]))\n    return LST_list\n\n\n',
        start_time: null,
        end_time: null,
        status: 'NEW_OBJECT',
        output: null,
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 14,
        doc: null,
      },
      {
        name: 'altitude_of_target',
        kwargs: {
          dec: '<covalent._workflow.electron.Electron object at 0x7f5e61fa1070>',
          lat: '49.2827',
          ha: '<covalent._workflow.electron.Electron object at 0x7f5e61fa1b80>',
        },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef altitude_of_target(dec, lat, ha):\n    alt_list = []\n    lat = lat * 0.0174533\n    for i in range(len(dec)):\n        dec_i = dec[i] * 0.0174533\n        ha_i = ha[i] * 0.0174533\n        alt = np.arcsin(\n            np.sin(dec_i) * np.sin(lat) + np.cos(dec_i) * np.cos(lat) * np.cos(ha_i)\n        )\n        alt_list.append(alt * 57.2958)\n    return alt_list\n\n\n',
        start_time: null,
        end_time: null,
        status: 'NEW_OBJECT',
        output: null,
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 15,
        doc: null,
      },
      {
        name: ':parameter:49.2827',
        kwargs: { lat: '49.2827' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601227+00:00',
        end_time: '2022-02-02T12:06:18.601233+00:00',
        status: 'COMPLETED',
        output: 49.2827,
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 16,
        doc: null,
      },
      {
        name: 'get_azimuth',
        kwargs: {
          dec: '<covalent._workflow.electron.Electron object at 0x7f5e61fa1070>',
          lat: '49.2827',
          ha: '<covalent._workflow.electron.Electron object at 0x7f5e61fa1b80>',
          alt: '<covalent._workflow.electron.Electron object at 0x7f5e60a3f760>',
        },
        metadata: {
          backend: 'local',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        function_string:
          '# @ct.electron\ndef get_azimuth(dec, lat, ha, alt):\n    az_list = []\n    lat = round(lat * 0.0174533, 2)\n    for i in range(len(dec)):\n        azimuth = []\n        dec_i = round(dec[i] * 0.0174533, 2)\n        ha_i = ha[i] * 0.0174533\n        alt_i = alt[i] * 0.0174533\n        a = np.arccos(\n            (np.sin(dec_i) - np.sin(alt_i) * np.sin(lat))\n            / (np.cos(alt_i) * np.cos(lat))\n        )\n        for q in range(len(ha_i)):\n            if np.sin(ha_i[q]) < 0:\n                azimuth.append(a[q] * 57.2958)\n            else:\n                azimuth.append(360 - (a[q] * 57.2958))\n        az_list.append(np.array(azimuth))\n    return az_list\n\n\n',
        start_time: null,
        end_time: null,
        status: 'NEW_OBJECT',
        output: null,
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        exec_plan: { selected_executor: 'local', execution_args: {} },
        id: 17,
        doc: null,
      },
      {
        name: ':parameter:49.2827',
        kwargs: { lat: '49.2827' },
        metadata: {
          schedule: false,
          num_cpu: 1,
          cpu_feature_set: [],
          num_gpu: 0,
          gpu_type: '',
          gpu_compute_capability: [],
          memory: '1G',
          backend: 'local',
          time_limit: '00-00:00:00',
          budget: 0,
          conda_env: '',
          executor: {
            log_stdout: 'stdout.log',
            log_stderr: 'stderr.log',
            conda_env: '',
            cache_dir: '/tmp/covalent',
            current_env_on_conda_fail: 'False',
            current_env: '',
          },
        },
        start_time: '2022-02-02T12:06:18.601253+00:00',
        end_time: '2022-02-02T12:06:18.601258+00:00',
        status: 'COMPLETED',
        output: 49.2827,
        error: null,
        sublattice_result: null,
        stdout: null,
        stderr: null,
        id: 18,
        doc: null,
      },
    ],
    links: [
      { variable: 'RA', source: 0, target: 14 },
      { variable: 'target_list', source: 1, target: 0 },
      { variable: 'target_list', source: 2, target: 1 },
      { variable: 'target_list', source: 3, target: 1 },
      { variable: 'dec', source: 4, target: 15 },
      { variable: 'dec', source: 4, target: 17 },
      { variable: 'target_list', source: 5, target: 4 },
      { variable: 'target_list', source: 6, target: 5 },
      { variable: 'target_list', source: 7, target: 5 },
      { variable: 'T', source: 8, target: 12 },
      { variable: 'time_zone', source: 9, target: 8 },
      { variable: 'd', source: 10, target: 12 },
      { variable: 'region', source: 11, target: 10 },
      { variable: 'LST', source: 12, target: 14 },
      { variable: 'long', source: 13, target: 12 },
      { variable: 'ha', source: 14, target: 15 },
      { variable: 'ha', source: 14, target: 17 },
      { variable: 'alt', source: 15, target: 17 },
      { variable: 'lat', source: 16, target: 15 },
      { variable: 'lat', source: 18, target: 17 },
    ],
  },
}

export default result

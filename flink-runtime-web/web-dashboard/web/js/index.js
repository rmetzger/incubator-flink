angular.module('flinkApp', ['ui.router', 'angularMoment', 'nvd3', 'dndLists']).run(["$rootScope", function($rootScope) {
  $rootScope.sidebarVisible = false;
  return $rootScope.showSidebar = function() {
    $rootScope.sidebarVisible = !$rootScope.sidebarVisible;
    return $rootScope.sidebarClass = 'force-show';
  };
}]).value('flinkConfig', {
  jobServer: 'http://localhost:8081/',
  "refresh-interval": 10000
}).run(["JobsService", "MainService", "flinkConfig", "$interval", function(JobsService, MainService, flinkConfig, $interval) {
  return MainService.loadConfig().then(function(config) {
    angular.extend(flinkConfig, config);
    JobsService.listJobs();
    return $interval(function() {
      return JobsService.listJobs();
    }, flinkConfig["refresh-interval"]);
  });
}]).config(["$uiViewScrollProvider", function($uiViewScrollProvider) {
  return $uiViewScrollProvider.useAnchorScroll();
}]).run(["$rootScope", "$state", function($rootScope, $state) {
  return $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    if (toState.redirectTo) {
      event.preventDefault();
      return $state.go(toState.redirectTo, toParams);
    }
  });
}]).config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
  $stateProvider.state("overview", {
    url: "/overview",
    views: {
      main: {
        templateUrl: "partials/overview.html",
        controller: 'OverviewController'
      }
    }
  }).state("running-jobs", {
    url: "/running-jobs",
    views: {
      main: {
        templateUrl: "partials/jobs/running-jobs.html",
        controller: 'RunningJobsController'
      }
    }
  }).state("completed-jobs", {
    url: "/completed-jobs",
    views: {
      main: {
        templateUrl: "partials/jobs/completed-jobs.html",
        controller: 'CompletedJobsController'
      }
    }
  }).state("single-job", {
    url: "/jobs/{jobid}",
    abstract: true,
    views: {
      main: {
        templateUrl: "partials/jobs/job.html",
        controller: 'SingleJobController'
      }
    }
  }).state("single-job.plan", {
    url: "",
    redirectTo: "single-job.plan.subtasks",
    views: {
      details: {
        templateUrl: "partials/jobs/job.plan.html",
        controller: 'JobPlanController'
      }
    }
  }).state("single-job.plan.subtasks", {
    url: "",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.subtasks.html",
        controller: 'JobPlanSubtasksController'
      }
    }
  }).state("single-job.plan.metrics", {
    url: "/metrics",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.metrics.html",
        controller: 'JobPlanMetricsController'
      }
    }
  }).state("single-job.plan.taskmanagers", {
    url: "/taskmanagers",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.taskmanagers.html",
        controller: 'JobPlanTaskManagersController'
      }
    }
  }).state("single-job.plan.accumulators", {
    url: "/accumulators",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.accumulators.html",
        controller: 'JobPlanAccumulatorsController'
      }
    }
  }).state("single-job.plan.checkpoints", {
    url: "/checkpoints",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.checkpoints.html",
        controller: 'JobPlanCheckpointsController'
      }
    }
  }).state("single-job.plan.backpressure", {
    url: "/backpressure",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.backpressure.html",
        controller: 'JobPlanBackPressureController'
      }
    }
  }).state("single-job.timeline", {
    url: "/timeline",
    views: {
      details: {
        templateUrl: "partials/jobs/job.timeline.html"
      }
    }
  }).state("single-job.timeline.vertex", {
    url: "/{vertexId}",
    views: {
      vertex: {
        templateUrl: "partials/jobs/job.timeline.vertex.html",
        controller: 'JobTimelineVertexController'
      }
    }
  }).state("single-job.exceptions", {
    url: "/exceptions",
    views: {
      details: {
        templateUrl: "partials/jobs/job.exceptions.html",
        controller: 'JobExceptionsController'
      }
    }
  }).state("single-job.config", {
    url: "/config",
    views: {
      details: {
        templateUrl: "partials/jobs/job.config.html"
      }
    }
  }).state("all-manager", {
    url: "/taskmanagers",
    views: {
      main: {
        templateUrl: "partials/taskmanager/index.html",
        controller: 'AllTaskManagersController'
      }
    }
  }).state("single-manager", {
    url: "/taskmanager/{taskmanagerid}",
    views: {
      main: {
        templateUrl: "partials/taskmanager/taskmanager.html"
      }
    }
  }).state("single-manager.metrics", {
    url: "/metrics",
    views: {
      details: {
        templateUrl: "partials/taskmanager/taskmanager.metrics.html",
        controller: 'SingleTaskManagerController'
      }
    }
  }).state("single-manager.stdout", {
    url: "/stdout",
    views: {
      details: {
        templateUrl: "partials/taskmanager/taskmanager.stdout.html",
        controller: 'SingleTaskManagerStdoutController'
      }
    }
  }).state("single-manager.log", {
    url: "/log",
    views: {
      details: {
        templateUrl: "partials/taskmanager/taskmanager.log.html",
        controller: 'SingleTaskManagerLogsController'
      }
    }
  }).state("jobmanager", {
    url: "/jobmanager",
    views: {
      main: {
        templateUrl: "partials/jobmanager/index.html"
      }
    }
  }).state("jobmanager.config", {
    url: "/config",
    views: {
      details: {
        templateUrl: "partials/jobmanager/config.html",
        controller: 'JobManagerConfigController'
      }
    }
  }).state("jobmanager.stdout", {
    url: "/stdout",
    views: {
      details: {
        templateUrl: "partials/jobmanager/stdout.html",
        controller: 'JobManagerStdoutController'
      }
    }
  }).state("jobmanager.log", {
    url: "/log",
    views: {
      details: {
        templateUrl: "partials/jobmanager/log.html",
        controller: 'JobManagerLogsController'
      }
    }
  }).state("submit", {
    url: "/submit",
    views: {
      main: {
        templateUrl: "partials/submit.html",
        controller: "JobSubmitController"
      }
    }
  });
  return $urlRouterProvider.otherwise("/overview");
}]);

angular.module('flinkApp').directive('bsLabel', ["JobsService", function(JobsService) {
  return {
    transclude: true,
    replace: true,
    scope: {
      getLabelClass: "&",
      status: "@"
    },
    template: "<span title='{{status}}' ng-class='getLabelClass()'><ng-transclude></ng-transclude></span>",
    link: function(scope, element, attrs) {
      return scope.getLabelClass = function() {
        return 'label label-' + JobsService.translateLabelState(attrs.status);
      };
    }
  };
}]).directive('bpLabel', ["JobsService", function(JobsService) {
  return {
    transclude: true,
    replace: true,
    scope: {
      getBackPressureLabelClass: "&",
      status: "@"
    },
    template: "<span title='{{status}}' ng-class='getBackPressureLabelClass()'><ng-transclude></ng-transclude></span>",
    link: function(scope, element, attrs) {
      return scope.getBackPressureLabelClass = function() {
        return 'label label-' + JobsService.translateBackPressureLabelState(attrs.status);
      };
    }
  };
}]).directive('indicatorPrimary', ["JobsService", function(JobsService) {
  return {
    replace: true,
    scope: {
      getLabelClass: "&",
      status: '@'
    },
    template: "<i title='{{status}}' ng-class='getLabelClass()' />",
    link: function(scope, element, attrs) {
      return scope.getLabelClass = function() {
        return 'fa fa-circle indicator indicator-' + JobsService.translateLabelState(attrs.status);
      };
    }
  };
}]).directive('tableProperty', function() {
  return {
    replace: true,
    scope: {
      value: '='
    },
    template: "<td title=\"{{value || 'None'}}\">{{value || 'None'}}</td>"
  };
});

angular.module('flinkApp').filter("amDurationFormatExtended", ["angularMomentConfig", function(angularMomentConfig) {
  var amDurationFormatExtendedFilter;
  amDurationFormatExtendedFilter = function(value, format, durationFormat) {
    if (typeof value === "undefined" || value === null) {
      return "";
    }
    return moment.duration(value, format).format(durationFormat, {
      trim: false
    });
  };
  amDurationFormatExtendedFilter.$stateful = angularMomentConfig.statefulFilters;
  return amDurationFormatExtendedFilter;
}]).filter("humanizeDuration", function() {
  return function(value, short) {
    var days, hours, minutes, ms, seconds, x;
    if (typeof value === "undefined" || value === null) {
      return "";
    }
    ms = value % 1000;
    x = Math.floor(value / 1000);
    seconds = x % 60;
    x = Math.floor(x / 60);
    minutes = x % 60;
    x = Math.floor(x / 60);
    hours = x % 24;
    x = Math.floor(x / 24);
    days = x;
    if (days === 0) {
      if (hours === 0) {
        if (minutes === 0) {
          if (seconds === 0) {
            return ms + "ms";
          } else {
            return seconds + "s ";
          }
        } else {
          return minutes + "m " + seconds + "s";
        }
      } else {
        if (short) {
          return hours + "h " + minutes + "m";
        } else {
          return hours + "h " + minutes + "m " + seconds + "s";
        }
      }
    } else {
      if (short) {
        return days + "d " + hours + "h";
      } else {
        return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      }
    }
  };
}).filter("humanizeText", function() {
  return function(text) {
    if (text) {
      return text.replace(/&gt;/g, ">").replace(/<br\/>/g, "");
    } else {
      return '';
    }
  };
}).filter("humanizeBytes", function() {
  return function(bytes) {
    var converter, units;
    units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
    converter = function(value, power) {
      var base;
      base = Math.pow(1024, power);
      if (value < base) {
        return (value / base).toFixed(2) + " " + units[power];
      } else if (value < base * 1000) {
        return (value / base).toPrecision(3) + " " + units[power];
      } else {
        return converter(value, power + 1);
      }
    };
    if (typeof bytes === "undefined" || bytes === null) {
      return "";
    }
    if (bytes < 1000) {
      return bytes + " B";
    } else {
      return converter(bytes, 1);
    }
  };
}).filter("toUpperCase", function() {
  return function(text) {
    return text.toUpperCase();
  };
});

angular.module('flinkApp').service('MainService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadConfig = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "config").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('JobManagerConfigController', ["$scope", "JobManagerConfigService", function($scope, JobManagerConfigService) {
  return JobManagerConfigService.loadConfig().then(function(data) {
    if ($scope.jobmanager == null) {
      $scope.jobmanager = {};
    }
    return $scope.jobmanager['config'] = data;
  });
}]).controller('JobManagerLogsController', ["$scope", "JobManagerLogsService", function($scope, JobManagerLogsService) {
  JobManagerLogsService.loadLogs().then(function(data) {
    if ($scope.jobmanager == null) {
      $scope.jobmanager = {};
    }
    return $scope.jobmanager['log'] = data;
  });
  return $scope.reloadData = function() {
    return JobManagerLogsService.loadLogs().then(function(data) {
      return $scope.jobmanager['log'] = data;
    });
  };
}]).controller('JobManagerStdoutController', ["$scope", "JobManagerStdoutService", function($scope, JobManagerStdoutService) {
  JobManagerStdoutService.loadStdout().then(function(data) {
    if ($scope.jobmanager == null) {
      $scope.jobmanager = {};
    }
    return $scope.jobmanager['stdout'] = data;
  });
  return $scope.reloadData = function() {
    return JobManagerStdoutService.loadStdout().then(function(data) {
      return $scope.jobmanager['stdout'] = data;
    });
  };
}]);

angular.module('flinkApp').service('JobManagerConfigService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var config;
  config = {};
  this.loadConfig = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobmanager/config").success(function(data, status, headers, config) {
      config = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]).service('JobManagerLogsService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var logs;
  logs = {};
  this.loadLogs = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobmanager/log").success(function(data, status, headers, config) {
      logs = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]).service('JobManagerStdoutService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var stdout;
  stdout = {};
  this.loadStdout = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobmanager/stdout").success(function(data, status, headers, config) {
      stdout = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('RunningJobsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  $scope.jobObserver = function() {
    return $scope.jobs = JobsService.getJobs('running');
  };
  JobsService.registerObserver($scope.jobObserver);
  $scope.$on('$destroy', function() {
    return JobsService.unRegisterObserver($scope.jobObserver);
  });
  return $scope.jobObserver();
}]).controller('CompletedJobsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  $scope.jobObserver = function() {
    return $scope.jobs = JobsService.getJobs('finished');
  };
  JobsService.registerObserver($scope.jobObserver);
  $scope.$on('$destroy', function() {
    return JobsService.unRegisterObserver($scope.jobObserver);
  });
  return $scope.jobObserver();
}]).controller('SingleJobController', ["$scope", "$state", "$stateParams", "JobsService", "$rootScope", "flinkConfig", "$interval", function($scope, $state, $stateParams, JobsService, $rootScope, flinkConfig, $interval) {
  var refresher;
  console.log('SingleJobController');
  $scope.jobid = $stateParams.jobid;
  $scope.job = null;
  $scope.plan = null;
  $scope.vertices = null;
  $scope.jobCheckpointStats = null;
  $scope.showHistory = false;
  $scope.backPressureOperatorStats = {};
  JobsService.loadJob($stateParams.jobid).then(function(data) {
    $scope.job = data;
    $scope.plan = data.plan;
    return $scope.vertices = data.vertices;
  });
  refresher = $interval(function() {
    return JobsService.loadJob($stateParams.jobid).then(function(data) {
      $scope.job = data;
      return $scope.$broadcast('reload');
    });
  }, flinkConfig["refresh-interval"]);
  $scope.$on('$destroy', function() {
    $scope.job = null;
    $scope.plan = null;
    $scope.vertices = null;
    $scope.jobCheckpointStats = null;
    $scope.backPressureOperatorStats = null;
    return $interval.cancel(refresher);
  });
  $scope.cancelJob = function(cancelEvent) {
    angular.element(cancelEvent.currentTarget).removeClass("btn").removeClass("btn-default").html('Cancelling...');
    return JobsService.cancelJob($stateParams.jobid).then(function(data) {
      return {};
    });
  };
  $scope.stopJob = function(stopEvent) {
    angular.element(stopEvent.currentTarget).removeClass("btn").removeClass("btn-default").html('Stopping...');
    return JobsService.stopJob($stateParams.jobid).then(function(data) {
      return {};
    });
  };
  return $scope.toggleHistory = function() {
    return $scope.showHistory = !$scope.showHistory;
  };
}]).controller('JobPlanController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  console.log('JobPlanController');
  $scope.nodeid = null;
  $scope.nodeUnfolded = false;
  $scope.stateList = JobsService.stateList();
  $scope.changeNode = function(nodeid) {
    if (nodeid !== $scope.nodeid) {
      $scope.nodeid = nodeid;
      $scope.vertex = null;
      $scope.subtasks = null;
      $scope.accumulators = null;
      $scope.operatorCheckpointStats = null;
      return $scope.$broadcast('reload');
    } else {
      $scope.nodeid = null;
      $scope.nodeUnfolded = false;
      $scope.vertex = null;
      $scope.subtasks = null;
      $scope.accumulators = null;
      return $scope.operatorCheckpointStats = null;
    }
  };
  $scope.deactivateNode = function() {
    $scope.nodeid = null;
    $scope.nodeUnfolded = false;
    $scope.vertex = null;
    $scope.subtasks = null;
    $scope.accumulators = null;
    return $scope.operatorCheckpointStats = null;
  };
  return $scope.toggleFold = function() {
    return $scope.nodeUnfolded = !$scope.nodeUnfolded;
  };
}]).controller('JobPlanSubtasksController', ["$scope", "JobsService", function($scope, JobsService) {
  var getSubtasks;
  console.log('JobPlanSubtasksController');
  getSubtasks = function() {
    return JobsService.getSubtasks($scope.nodeid).then(function(data) {
      return $scope.subtasks = data;
    });
  };
  if ($scope.nodeid && (!$scope.vertex || !$scope.vertex.st)) {
    getSubtasks();
  }
  return $scope.$on('reload', function(event) {
    console.log('JobPlanSubtasksController');
    if ($scope.nodeid) {
      return getSubtasks();
    }
  });
}]).controller('JobPlanTaskManagersController', ["$scope", "JobsService", function($scope, JobsService) {
  var getTaskManagers;
  console.log('JobPlanTaskManagersController');
  getTaskManagers = function() {
    return JobsService.getTaskManagers($scope.nodeid).then(function(data) {
      return $scope.taskmanagers = data;
    });
  };
  if ($scope.nodeid && (!$scope.vertex || !$scope.vertex.st)) {
    getTaskManagers();
  }
  return $scope.$on('reload', function(event) {
    console.log('JobPlanTaskManagersController');
    if ($scope.nodeid) {
      return getTaskManagers();
    }
  });
}]).controller('JobPlanAccumulatorsController', ["$scope", "JobsService", function($scope, JobsService) {
  var getAccumulators;
  console.log('JobPlanAccumulatorsController');
  getAccumulators = function() {
    return JobsService.getAccumulators($scope.nodeid).then(function(data) {
      $scope.accumulators = data.main;
      return $scope.subtaskAccumulators = data.subtasks;
    });
  };
  if ($scope.nodeid && (!$scope.vertex || !$scope.vertex.accumulators)) {
    getAccumulators();
  }
  return $scope.$on('reload', function(event) {
    console.log('JobPlanAccumulatorsController');
    if ($scope.nodeid) {
      return getAccumulators();
    }
  });
}]).controller('JobPlanCheckpointsController', ["$scope", "JobsService", function($scope, JobsService) {
  var getJobCheckpointStats, getOperatorCheckpointStats;
  console.log('JobPlanCheckpointsController');
  getJobCheckpointStats = function() {
    return JobsService.getJobCheckpointStats($scope.jobid).then(function(data) {
      return $scope.jobCheckpointStats = data;
    });
  };
  getOperatorCheckpointStats = function() {
    return JobsService.getOperatorCheckpointStats($scope.nodeid).then(function(data) {
      $scope.operatorCheckpointStats = data.operatorStats;
      return $scope.subtasksCheckpointStats = data.subtasksStats;
    });
  };
  getJobCheckpointStats();
  if ($scope.nodeid && (!$scope.vertex || !$scope.vertex.operatorCheckpointStats)) {
    getOperatorCheckpointStats();
  }
  return $scope.$on('reload', function(event) {
    console.log('JobPlanCheckpointsController');
    getJobCheckpointStats();
    if ($scope.nodeid) {
      return getOperatorCheckpointStats();
    }
  });
}]).controller('JobPlanBackPressureController', ["$scope", "JobsService", function($scope, JobsService) {
  var getOperatorBackPressure;
  console.log('JobPlanBackPressureController');
  getOperatorBackPressure = function() {
    $scope.now = Date.now();
    if ($scope.nodeid) {
      JobsService.getOperatorBackPressure($scope.nodeid).then(function(data) {});
      return $scope.backPressureOperatorStats[$scope.nodeid] = data;
    }
  };
  getOperatorBackPressure();
  return $scope.$on('reload', function(event) {
    console.log('JobPlanBackPressureController (reload)');
    return getOperatorBackPressure();
  });
}]).controller('JobTimelineVertexController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  var getVertex;
  console.log('JobTimelineVertexController');
  getVertex = function() {
    return JobsService.getVertex($stateParams.vertexId).then(function(data) {
      return $scope.vertex = data;
    });
  };
  getVertex();
  return $scope.$on('reload', function(event) {
    console.log('JobTimelineVertexController');
    return getVertex();
  });
}]).controller('JobExceptionsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  return JobsService.loadExceptions().then(function(data) {
    return $scope.exceptions = data;
  });
}]).controller('JobPropertiesController', ["$scope", "JobsService", function($scope, JobsService) {
  console.log('JobPropertiesController');
  return $scope.changeNode = function(nodeid) {
    if (nodeid !== $scope.nodeid) {
      $scope.nodeid = nodeid;
      return JobsService.getNode(nodeid).then(function(data) {
        return $scope.node = data;
      });
    } else {
      $scope.nodeid = null;
      return $scope.node = null;
    }
  };
}]).controller('JobPlanMetricsController', ["$scope", "JobsService", "MetricsService", function($scope, JobsService, MetricsService) {
  var loadMetrics, sine;
  console.log('JobPlanMetricsController');
  sine = function() {
    var i, now, sin;
    sin = [];
    now = +(new Date);
    i = 0;
    while (i < 100) {
      sin.push({
        x: now + i * 1000 * 60 * 60 * 24,
        y: Math.sin(i / 10)
      });
      i++;
    }
    return sin;
  };
  loadMetrics = function() {
    JobsService.getVertex($scope.nodeid).then(function(data) {
      return $scope.vertex = data;
    });
    return MetricsService.getAvailableMetrics($scope.jobid, $scope.nodeid).then(function(data) {
      var setup;
      $scope.availableMetrics = data;
      setup = MetricsService.getMetricsSetup($scope.jobid, $scope.nodeid);
      $scope.metrics = setup.list;
      return MetricsService.getMetrics($scope.jobid, $scope.nodeid, setup.list).then(function(data) {
        return $scope.$broadcast("metrics:data:update", data);
      });
    });
  };
  $scope.options = {
    chart: {
      type: 'sparklinePlus',
      height: 150,
      x: function(d, i) {
        return i;
      },
      xTickFormat: function(d) {
        return d3.time.format('%x')(new Date($scope.data[d].x));
      },
      duration: 250
    }
  };
  $scope.data = sine();
  $scope.addMetric = function(metric) {
    console.log(metric);
    MetricsService.addMetric($scope.jobid, $scope.nodeid, metric.id);
    return loadMetrics();
  };
  $scope.removeMetric = function(metricId) {
    console.log(metricId);
    MetricsService.removeMetric($scope.jobid, $scope.nodeid, metricId);
    return loadMetrics();
  };
  $scope.$on('reload', function(event) {
    console.log('JobPlanMetricsController');
    if ($scope.nodeid) {
      return loadMetrics();
    }
  });
  if ($scope.nodeid) {
    return loadMetrics();
  }
}]);

angular.module('flinkApp').directive('vertex', ["$state", function($state) {
  return {
    template: "<svg class='timeline secondary' width='0' height='0'></svg>",
    scope: {
      data: "="
    },
    link: function(scope, elem, attrs) {
      var analyzeTime, containerW, svgEl;
      svgEl = elem.children()[0];
      containerW = elem.width();
      angular.element(svgEl).attr('width', containerW);
      analyzeTime = function(data) {
        var chart, svg, testData;
        d3.select(svgEl).selectAll("*").remove();
        testData = [];
        angular.forEach(data.subtasks, function(subtask, i) {
          var times;
          times = [
            {
              label: "Scheduled",
              color: "#666",
              borderColor: "#555",
              starting_time: subtask.timestamps["SCHEDULED"],
              ending_time: subtask.timestamps["DEPLOYING"],
              type: 'regular'
            }, {
              label: "Deploying",
              color: "#aaa",
              borderColor: "#555",
              starting_time: subtask.timestamps["DEPLOYING"],
              ending_time: subtask.timestamps["RUNNING"],
              type: 'regular'
            }
          ];
          if (subtask.timestamps["FINISHED"] > 0) {
            times.push({
              label: "Running",
              color: "#ddd",
              borderColor: "#555",
              starting_time: subtask.timestamps["RUNNING"],
              ending_time: subtask.timestamps["FINISHED"],
              type: 'regular'
            });
          }
          return testData.push({
            label: "(" + subtask.subtask + ") " + subtask.host,
            times: times
          });
        });
        chart = d3.timeline().stack().tickFormat({
          format: d3.time.format("%L"),
          tickSize: 1
        }).prefix("single").labelFormat(function(label) {
          return label;
        }).margin({
          left: 100,
          right: 0,
          top: 0,
          bottom: 0
        }).itemHeight(30).relativeTime();
        return svg = d3.select(svgEl).datum(testData).call(chart);
      };
      analyzeTime(scope.data);
    }
  };
}]).directive('timeline', ["$state", function($state) {
  return {
    template: "<svg class='timeline' width='0' height='0'></svg>",
    scope: {
      vertices: "=",
      jobid: "="
    },
    link: function(scope, elem, attrs) {
      var analyzeTime, containerW, svgEl, translateLabel;
      svgEl = elem.children()[0];
      containerW = elem.width();
      angular.element(svgEl).attr('width', containerW);
      translateLabel = function(label) {
        return label.replace("&gt;", ">");
      };
      analyzeTime = function(data) {
        var chart, svg, testData;
        d3.select(svgEl).selectAll("*").remove();
        testData = [];
        angular.forEach(data, function(vertex) {
          if (vertex['start-time'] > -1) {
            if (vertex.type === 'scheduled') {
              return testData.push({
                times: [
                  {
                    label: translateLabel(vertex.name),
                    color: "#cccccc",
                    borderColor: "#555555",
                    starting_time: vertex['start-time'],
                    ending_time: vertex['end-time'],
                    type: vertex.type
                  }
                ]
              });
            } else {
              return testData.push({
                times: [
                  {
                    label: translateLabel(vertex.name),
                    color: "#d9f1f7",
                    borderColor: "#62cdea",
                    starting_time: vertex['start-time'],
                    ending_time: vertex['end-time'],
                    link: vertex.id,
                    type: vertex.type
                  }
                ]
              });
            }
          }
        });
        chart = d3.timeline().stack().click(function(d, i, datum) {
          if (d.link) {
            return $state.go("single-job.timeline.vertex", {
              jobid: scope.jobid,
              vertexId: d.link
            });
          }
        }).tickFormat({
          format: d3.time.format("%L"),
          tickSize: 1
        }).prefix("main").margin({
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }).itemHeight(30).showBorderLine().showHourTimeline();
        return svg = d3.select(svgEl).datum(testData).call(chart);
      };
      scope.$watch(attrs.vertices, function(data) {
        if (data) {
          return analyzeTime(data);
        }
      });
    }
  };
}]).directive('jobPlan', ["$timeout", function($timeout) {
  return {
    template: "<svg class='graph' width='500' height='400'><g /></svg> <svg class='tmp' width='1' height='1'><g /></svg> <div class='btn-group zoom-buttons'> <a class='btn btn-default zoom-in' ng-click='zoomIn()'><i class='fa fa-plus' /></a> <a class='btn btn-default zoom-out' ng-click='zoomOut()'><i class='fa fa-minus' /></a> </div>",
    scope: {
      plan: '=',
      setNode: '&'
    },
    link: function(scope, elem, attrs) {
      var containerW, createEdge, createLabelEdge, createLabelNode, createNode, d3mainSvg, d3mainSvgG, d3tmpSvg, drawGraph, extendLabelNodeForIteration, g, getNodeType, isSpecialIterationNode, jobid, loadJsonToDagre, mainG, mainSvgElement, mainTmpElement, mainZoom, searchForNode, shortenString, subgraphs;
      g = null;
      mainZoom = d3.behavior.zoom();
      subgraphs = [];
      jobid = attrs.jobid;
      mainSvgElement = elem.children()[0];
      mainG = elem.children().children()[0];
      mainTmpElement = elem.children()[1];
      d3mainSvg = d3.select(mainSvgElement);
      d3mainSvgG = d3.select(mainG);
      d3tmpSvg = d3.select(mainTmpElement);
      containerW = elem.width();
      angular.element(elem.children()[0]).width(containerW);
      scope.zoomIn = function() {
        var translate, v1, v2;
        if (mainZoom.scale() < 2.99) {
          translate = mainZoom.translate();
          v1 = translate[0] * (mainZoom.scale() + 0.1 / (mainZoom.scale()));
          v2 = translate[1] * (mainZoom.scale() + 0.1 / (mainZoom.scale()));
          mainZoom.scale(mainZoom.scale() + 0.1);
          mainZoom.translate([v1, v2]);
          return d3mainSvgG.attr("transform", "translate(" + v1 + "," + v2 + ") scale(" + mainZoom.scale() + ")");
        }
      };
      scope.zoomOut = function() {
        var translate, v1, v2;
        if (mainZoom.scale() > 0.31) {
          mainZoom.scale(mainZoom.scale() - 0.1);
          translate = mainZoom.translate();
          v1 = translate[0] * (mainZoom.scale() - 0.1 / (mainZoom.scale()));
          v2 = translate[1] * (mainZoom.scale() - 0.1 / (mainZoom.scale()));
          mainZoom.translate([v1, v2]);
          return d3mainSvgG.attr("transform", "translate(" + v1 + "," + v2 + ") scale(" + mainZoom.scale() + ")");
        }
      };
      createLabelEdge = function(el) {
        var labelValue;
        labelValue = "";
        if ((el.ship_strategy != null) || (el.local_strategy != null)) {
          labelValue += "<div class='edge-label'>";
          if (el.ship_strategy != null) {
            labelValue += el.ship_strategy;
          }
          if (el.temp_mode !== undefined) {
            labelValue += " (" + el.temp_mode + ")";
          }
          if (el.local_strategy !== undefined) {
            labelValue += ",<br>" + el.local_strategy;
          }
          labelValue += "</div>";
        }
        return labelValue;
      };
      isSpecialIterationNode = function(info) {
        return info === "partialSolution" || info === "nextPartialSolution" || info === "workset" || info === "nextWorkset" || info === "solutionSet" || info === "solutionDelta";
      };
      getNodeType = function(el, info) {
        if (info === "mirror") {
          return 'node-mirror';
        } else if (isSpecialIterationNode(info)) {
          return 'node-iteration';
        } else {
          return 'node-normal';
        }
      };
      createLabelNode = function(el, info, maxW, maxH) {
        var labelValue, stepName;
        labelValue = "<div href='#/jobs/" + jobid + "/vertex/" + el.id + "' class='node-label " + getNodeType(el, info) + "'>";
        if (info === "mirror") {
          labelValue += "<h3 class='node-name'>Mirror of " + el.operator + "</h3>";
        } else {
          labelValue += "<h3 class='node-name'>" + el.operator + "</h3>";
        }
        if (el.description === "") {
          labelValue += "";
        } else {
          stepName = el.description;
          stepName = shortenString(stepName);
          labelValue += "<h4 class='step-name'>" + stepName + "</h4>";
        }
        if (el.step_function != null) {
          labelValue += extendLabelNodeForIteration(el.id, maxW, maxH);
        } else {
          if (isSpecialIterationNode(info)) {
            labelValue += "<h5>" + info + " Node</h5>";
          }
          if (el.parallelism !== "") {
            labelValue += "<h5>Parallelism: " + el.parallelism + "</h5>";
          }
          if (el.operator !== undefined) {
            labelValue += "<h5>Operation: " + shortenString(el.operator_strategy) + "</h5>";
          }
        }
        labelValue += "</div>";
        return labelValue;
      };
      extendLabelNodeForIteration = function(id, maxW, maxH) {
        var labelValue, svgID;
        svgID = "svg-" + id;
        labelValue = "<svg class='" + svgID + "' width=" + maxW + " height=" + maxH + "><g /></svg>";
        return labelValue;
      };
      shortenString = function(s) {
        var sbr;
        if (s.charAt(0) === "<") {
          s = s.replace("<", "&lt;");
          s = s.replace(">", "&gt;");
        }
        sbr = "";
        while (s.length > 30) {
          sbr = sbr + s.substring(0, 30) + "<br>";
          s = s.substring(30, s.length);
        }
        sbr = sbr + s;
        return sbr;
      };
      createNode = function(g, data, el, isParent, maxW, maxH) {
        if (isParent == null) {
          isParent = false;
        }
        if (el.id === data.partial_solution) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "partialSolution", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "partialSolution")
          });
        } else if (el.id === data.next_partial_solution) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "nextPartialSolution", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "nextPartialSolution")
          });
        } else if (el.id === data.workset) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "workset", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "workset")
          });
        } else if (el.id === data.next_workset) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "nextWorkset", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "nextWorkset")
          });
        } else if (el.id === data.solution_set) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "solutionSet", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "solutionSet")
          });
        } else if (el.id === data.solution_delta) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "solutionDelta", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "solutionDelta")
          });
        } else {
          return g.setNode(el.id, {
            label: createLabelNode(el, "", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "")
          });
        }
      };
      createEdge = function(g, data, el, existingNodes, pred) {
        var missingNode;
        if (existingNodes.indexOf(pred.id) !== -1) {
          return g.setEdge(pred.id, el.id, {
            label: createLabelEdge(pred),
            labelType: 'html',
            arrowhead: 'normal'
          });
        } else {
          missingNode = searchForNode(data, pred.id);
          if (!!missingNode) {
            return g.setEdge(missingNode.id, el.id, {
              label: createLabelEdge(missingNode),
              labelType: 'html'
            });
          }
        }
      };
      loadJsonToDagre = function(g, data) {
        var el, existingNodes, isParent, k, l, len, len1, maxH, maxW, pred, r, ref, sg, toIterate;
        existingNodes = [];
        if (data.nodes != null) {
          toIterate = data.nodes;
        } else {
          toIterate = data.step_function;
          isParent = true;
        }
        for (k = 0, len = toIterate.length; k < len; k++) {
          el = toIterate[k];
          maxW = 0;
          maxH = 0;
          if (el.step_function) {
            sg = new dagreD3.graphlib.Graph({
              multigraph: true,
              compound: true
            }).setGraph({
              nodesep: 20,
              edgesep: 0,
              ranksep: 20,
              rankdir: "LR",
              marginx: 10,
              marginy: 10
            });
            subgraphs[el.id] = sg;
            loadJsonToDagre(sg, el);
            r = new dagreD3.render();
            d3tmpSvg.select('g').call(r, sg);
            maxW = sg.graph().width;
            maxH = sg.graph().height;
            angular.element(mainTmpElement).empty();
          }
          createNode(g, data, el, isParent, maxW, maxH);
          existingNodes.push(el.id);
          if (el.inputs != null) {
            ref = el.inputs;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              pred = ref[l];
              createEdge(g, data, el, existingNodes, pred);
            }
          }
        }
        return g;
      };
      searchForNode = function(data, nodeID) {
        var el, i, j;
        for (i in data.nodes) {
          el = data.nodes[i];
          if (el.id === nodeID) {
            return el;
          }
          if (el.step_function != null) {
            for (j in el.step_function) {
              if (el.step_function[j].id === nodeID) {
                return el.step_function[j];
              }
            }
          }
        }
      };
      drawGraph = function(data) {
        var i, newScale, renderer, sg, xCenterOffset, yCenterOffset;
        g = new dagreD3.graphlib.Graph({
          multigraph: true,
          compound: true
        }).setGraph({
          nodesep: 70,
          edgesep: 0,
          ranksep: 50,
          rankdir: "LR",
          marginx: 40,
          marginy: 40
        });
        loadJsonToDagre(g, data);
        renderer = new dagreD3.render();
        d3mainSvgG.call(renderer, g);
        for (i in subgraphs) {
          sg = subgraphs[i];
          d3mainSvg.select('svg.svg-' + i + ' g').call(renderer, sg);
        }
        newScale = 0.5;
        xCenterOffset = Math.floor((angular.element(mainSvgElement).width() - g.graph().width * newScale) / 2);
        yCenterOffset = Math.floor((angular.element(mainSvgElement).height() - g.graph().height * newScale) / 2);
        mainZoom.scale(newScale).translate([xCenterOffset, yCenterOffset]);
        d3mainSvgG.attr("transform", "translate(" + xCenterOffset + ", " + yCenterOffset + ") scale(" + mainZoom.scale() + ")");
        mainZoom.on("zoom", function() {
          var ev;
          ev = d3.event;
          return d3mainSvgG.attr("transform", "translate(" + ev.translate + ") scale(" + ev.scale + ")");
        });
        mainZoom(d3mainSvg);
        return d3mainSvgG.selectAll('.node').on('click', function(d) {
          return scope.setNode({
            nodeid: d
          });
        });
      };
      scope.$watch(attrs.plan, function(newPlan) {
        if (newPlan) {
          return drawGraph(newPlan);
        }
      });
    }
  };
}]);

angular.module('flinkApp').service('JobsService', ["$http", "flinkConfig", "$log", "amMoment", "$q", "$timeout", function($http, flinkConfig, $log, amMoment, $q, $timeout) {
  var currentJob, currentPlan, deferreds, jobObservers, jobs, notifyObservers;
  currentJob = null;
  currentPlan = null;
  deferreds = {};
  jobs = {
    running: [],
    finished: [],
    cancelled: [],
    failed: []
  };
  jobObservers = [];
  notifyObservers = function() {
    return angular.forEach(jobObservers, function(callback) {
      return callback();
    });
  };
  this.registerObserver = function(callback) {
    return jobObservers.push(callback);
  };
  this.unRegisterObserver = function(callback) {
    var index;
    index = jobObservers.indexOf(callback);
    return jobObservers.splice(index, 1);
  };
  this.stateList = function() {
    return ['SCHEDULED', 'DEPLOYING', 'RUNNING', 'FINISHED', 'FAILED', 'CANCELING', 'CANCELED'];
  };
  this.translateLabelState = function(state) {
    switch (state.toLowerCase()) {
      case 'finished':
        return 'success';
      case 'failed':
        return 'danger';
      case 'scheduled':
        return 'default';
      case 'deploying':
        return 'info';
      case 'running':
        return 'primary';
      case 'canceling':
        return 'warning';
      case 'pending':
        return 'info';
      case 'total':
        return 'black';
      default:
        return 'default';
    }
  };
  this.setEndTimes = function(list) {
    return angular.forEach(list, function(item, jobKey) {
      if (!(item['end-time'] > -1)) {
        return item['end-time'] = item['start-time'] + item['duration'];
      }
    });
  };
  this.processVertices = function(data) {
    angular.forEach(data.vertices, function(vertex, i) {
      return vertex.type = 'regular';
    });
    return data.vertices.unshift({
      name: 'Scheduled',
      'start-time': data.timestamps['CREATED'],
      'end-time': data.timestamps['CREATED'] + 1,
      type: 'scheduled'
    });
  };
  this.listJobs = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "joboverview").success((function(_this) {
      return function(data, status, headers, config) {
        angular.forEach(data, function(list, listKey) {
          switch (listKey) {
            case 'running':
              return jobs.running = _this.setEndTimes(list);
            case 'finished':
              return jobs.finished = _this.setEndTimes(list);
            case 'cancelled':
              return jobs.cancelled = _this.setEndTimes(list);
            case 'failed':
              return jobs.failed = _this.setEndTimes(list);
          }
        });
        deferred.resolve(jobs);
        return notifyObservers();
      };
    })(this));
    return deferred.promise;
  };
  this.getJobs = function(type) {
    return jobs[type];
  };
  this.getAllJobs = function() {
    return jobs;
  };
  this.loadJob = function(jobid) {
    currentJob = null;
    deferreds.job = $q.defer();
    $http.get(flinkConfig.jobServer + "jobs/" + jobid).success((function(_this) {
      return function(data, status, headers, config) {
        _this.setEndTimes(data.vertices);
        _this.processVertices(data);
        return $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/config").success(function(jobConfig) {
          data = angular.extend(data, jobConfig);
          currentJob = data;
          return deferreds.job.resolve(currentJob);
        });
      };
    })(this));
    return deferreds.job.promise;
  };
  this.getNode = function(nodeid) {
    var deferred, seekNode;
    seekNode = function(nodeid, data) {
      var j, len, node, sub;
      for (j = 0, len = data.length; j < len; j++) {
        node = data[j];
        if (node.id === nodeid) {
          return node;
        }
        if (node.step_function) {
          sub = seekNode(nodeid, node.step_function);
        }
        if (sub) {
          return sub;
        }
      }
      return null;
    };
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        var foundNode;
        foundNode = seekNode(nodeid, currentJob.plan.nodes);
        foundNode.vertex = _this.seekVertex(nodeid);
        return deferred.resolve(foundNode);
      };
    })(this));
    return deferred.promise;
  };
  this.seekVertex = function(nodeid) {
    var j, len, ref, vertex;
    ref = currentJob.vertices;
    for (j = 0, len = ref.length; j < len; j++) {
      vertex = ref[j];
      if (vertex.id === nodeid) {
        return vertex;
      }
    }
    return null;
  };
  this.getVertex = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        var vertex;
        vertex = _this.seekVertex(vertexid);
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/subtasktimes").success(function(data) {
          vertex.subtasks = data.subtasks;
          return deferred.resolve(vertex);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getSubtasks = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid).success(function(data) {
          var subtasks;
          subtasks = data.subtasks;
          return deferred.resolve(subtasks);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getTaskManagers = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/taskmanagers").success(function(data) {
          var taskmanagers;
          taskmanagers = data.taskmanagers;
          return deferred.resolve(taskmanagers);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getAccumulators = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/accumulators").success(function(data) {
          var accumulators;
          accumulators = data['user-accumulators'];
          return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/subtasks/accumulators").success(function(data) {
            var subtaskAccumulators;
            subtaskAccumulators = data.subtasks;
            return deferred.resolve({
              main: accumulators,
              subtasks: subtaskAccumulators
            });
          });
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getJobCheckpointStats = function(jobid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/checkpoints").success((function(_this) {
      return function(data, status, headers, config) {
        if (angular.equals({}, data)) {
          return deferred.resolve(deferred.resolve(null));
        } else {
          return deferred.resolve(data);
        }
      };
    })(this));
    return deferred.promise;
  };
  this.getOperatorCheckpointStats = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/checkpoints").success(function(data) {
          var operatorStats, subtaskStats;
          if (angular.equals({}, data)) {
            return deferred.resolve({
              operatorStats: null,
              subtasksStats: null
            });
          } else {
            operatorStats = {
              id: data['id'],
              timestamp: data['timestamp'],
              duration: data['duration'],
              size: data['size']
            };
            if (angular.equals({}, data['subtasks'])) {
              return deferred.resolve({
                operatorStats: operatorStats,
                subtasksStats: null
              });
            } else {
              subtaskStats = data['subtasks'];
              return deferred.resolve({
                operatorStats: operatorStats,
                subtasksStats: subtaskStats
              });
            }
          }
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getOperatorBackPressure = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/backpressure").success((function(_this) {
      return function(data) {
        return deferred.resolve(data);
      };
    })(this));
    return deferred.promise;
  };
  this.translateBackPressureLabelState = function(state) {
    switch (state.toLowerCase()) {
      case 'in-progress':
        return 'danger';
      case 'ok':
        return 'success';
      case 'low':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'default';
    }
  };
  this.loadExceptions = function() {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/exceptions").success(function(exceptions) {
          currentJob.exceptions = exceptions;
          return deferred.resolve(exceptions);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.cancelJob = function(jobid) {
    return $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/yarn-cancel");
  };
  this.stopJob = function(jobid) {
    return $http.get("jobs/" + jobid + "/yarn-stop");
  };
  return this;
}]);

angular.module('flinkApp').directive('metricsGraph', function() {
  return {
    template: '<div class="panel panel-default panel-metric"> <div class="panel-heading">{{mtype}} <a title="Remove" class="btn btn-default btn-xs pull-right" ng-click="removeMetric()"><i class="fa fa-close" /></a> </div> <div class="panel-body"> {{ value }} <!--<nvd3 options="options" data="data"></nvd3>--> </div> </div>',
    replace: true,
    scope: {
      mtype: "@",
      options: "=",
      data: "=",
      removeMetric: "&"
    },
    link: function(scope, element, attrs) {
      scope.value = null;
      scope.remove = function() {
        console.log('here');
        return scope.$destroy();
      };
      return scope.$on('metrics:data:update', function(event, data) {
        return scope.value = data[scope.mtype];
      });
    }
  };
});

angular.module('flinkApp').service('MetricsService', ["$http", "$q", "flinkConfig", function($http, $q, flinkConfig) {
  this.metrics = {};
  this.setupLS = function() {
    if (localStorage.flinkMetrics == null) {
      this.saveToLS();
    }
    return this.metrics = JSON.parse(localStorage.flinkMetrics);
  };
  this.saveToLS = function() {
    return localStorage.flinkMetrics = JSON.stringify(this.metrics);
  };
  this.setupLSFor = function(jobid, nodeid) {
    if (this.metrics[jobid] == null) {
      this.metrics[jobid] = {};
    }
    if (this.metrics[jobid][nodeid] == null) {
      return this.metrics[jobid][nodeid] = [];
    }
  };
  this.addMetric = function(jobid, nodeid, metricid) {
    this.setupLSFor(jobid, nodeid);
    this.metrics[jobid][nodeid].push(metricid);
    return this.saveToLS();
  };
  this.removeMetric = (function(_this) {
    return function(jobid, nodeid, metricid) {
      var i;
      if (_this.metrics[jobid][nodeid] != null) {
        i = _this.metrics[jobid][nodeid].indexOf(metricid);
        if (i !== -1) {
          _this.metrics[jobid][nodeid].splice(i, 1);
        }
        return _this.saveToLS();
      }
    };
  })(this);
  this.getMetricsSetup = (function(_this) {
    return function(jobid, nodeid) {
      return {
        list: _this.metrics[jobid][nodeid]
      };
    };
  })(this);
  this.getAvailableMetrics = (function(_this) {
    return function(jobid, nodeid) {
      var deferred;
      _this.setupLSFor(jobid, nodeid);
      deferred = $q.defer();
      $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics").success(function(data) {
        var results;
        results = [];
        angular.forEach(data.available, function(v, k) {
          if (_this.metrics[jobid][nodeid].indexOf(v.id) === -1) {
            return results.push(v);
          }
        });
        return deferred.resolve(results);
      });
      return deferred.promise;
    };
  })(this);
  this.getMetrics = function(jobid, nodeid, metricIds) {
    var deferred, ids;
    deferred = $q.defer();
    ids = metricIds.join(",");
    $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics?get=" + ids).success(function(data) {
      var result;
      result = {};
      return angular.forEach(data, function(v, k) {
        result[v.id] = v.value;
        return deferred.resolve(result);
      });
    });
    return deferred.promise;
  };
  this.setupLS();
  return this;
}]);

angular.module('flinkApp').controller('OverviewController', ["$scope", "OverviewService", "JobsService", "$interval", "flinkConfig", function($scope, OverviewService, JobsService, $interval, flinkConfig) {
  var refresh;
  $scope.jobObserver = function() {
    $scope.runningJobs = JobsService.getJobs('running');
    return $scope.finishedJobs = JobsService.getJobs('finished');
  };
  JobsService.registerObserver($scope.jobObserver);
  $scope.$on('$destroy', function() {
    return JobsService.unRegisterObserver($scope.jobObserver);
  });
  $scope.jobObserver();
  OverviewService.loadOverview().then(function(data) {
    return $scope.overview = data;
  });
  refresh = $interval(function() {
    return OverviewService.loadOverview().then(function(data) {
      return $scope.overview = data;
    });
  }, flinkConfig["refresh-interval"]);
  return $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
}]);

angular.module('flinkApp').service('OverviewService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var overview;
  overview = {};
  this.loadOverview = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "overview").success(function(data, status, headers, config) {
      overview = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('JobSubmitController', ["$scope", "JobSubmitService", "$interval", "flinkConfig", "$state", "$location", function($scope, JobSubmitService, $interval, flinkConfig, $state, $location) {
  var refresh;
  $scope.yarn = $location.absUrl().indexOf("/proxy/application_") !== -1;
  $scope.loadList = function() {
    return JobSubmitService.loadJarList().then(function(data) {
      $scope.address = data.address;
      $scope.noaccess = data.error;
      return $scope.jars = data.files;
    });
  };
  $scope.defaultState = function() {
    $scope.plan = null;
    $scope.error = null;
    return $scope.state = {
      selected: null,
      parallelism: "",
      'entry-class': "",
      'program-args': "",
      'plan-button': "Show Plan",
      'submit-button': "Submit",
      'action-time': 0
    };
  };
  $scope.defaultState();
  $scope.uploader = {};
  $scope.loadList();
  refresh = $interval(function() {
    return $scope.loadList();
  }, flinkConfig["refresh-interval"]);
  $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
  $scope.selectJar = function(id) {
    if ($scope.state.selected === id) {
      return $scope.defaultState();
    } else {
      $scope.defaultState();
      return $scope.state.selected = id;
    }
  };
  $scope.deleteJar = function(event, id) {
    if ($scope.state.selected === id) {
      $scope.defaultState();
    }
    angular.element(event.currentTarget).removeClass("fa-remove").addClass("fa-spin fa-spinner");
    return JobSubmitService.deleteJar(id).then(function(data) {
      angular.element(event.currentTarget).removeClass("fa-spin fa-spinner").addClass("fa-remove");
      if (data.error != null) {
        return alert(data.error);
      }
    });
  };
  $scope.loadEntryClass = function(name) {
    return $scope.state['entry-class'] = name;
  };
  $scope.getPlan = function() {
    var action;
    if ($scope.state['plan-button'] === "Show Plan") {
      action = new Date().getTime();
      $scope.state['action-time'] = action;
      $scope.state['submit-button'] = "Submit";
      $scope.state['plan-button'] = "Getting Plan";
      $scope.error = null;
      $scope.plan = null;
      return JobSubmitService.getPlan($scope.state.selected, {
        'entry-class': $scope.state['entry-class'],
        parallelism: $scope.state.parallelism,
        'program-args': $scope.state['program-args']
      }).then(function(data) {
        if (action === $scope.state['action-time']) {
          $scope.state['plan-button'] = "Show Plan";
          $scope.error = data.error;
          return $scope.plan = data.plan;
        }
      });
    }
  };
  $scope.runJob = function() {
    var action;
    if ($scope.state['submit-button'] === "Submit") {
      action = new Date().getTime();
      $scope.state['action-time'] = action;
      $scope.state['submit-button'] = "Submitting";
      $scope.state['plan-button'] = "Show Plan";
      $scope.error = null;
      return JobSubmitService.runJob($scope.state.selected, {
        'entry-class': $scope.state['entry-class'],
        parallelism: $scope.state.parallelism,
        'program-args': $scope.state['program-args']
      }).then(function(data) {
        if (action === $scope.state['action-time']) {
          $scope.state['submit-button'] = "Submit";
          $scope.error = data.error;
          if (data.jobid != null) {
            return $state.go("single-job.plan.subtasks", {
              jobid: data.jobid
            });
          }
        }
      });
    }
  };
  $scope.nodeid = null;
  $scope.changeNode = function(nodeid) {
    if (nodeid !== $scope.nodeid) {
      $scope.nodeid = nodeid;
      $scope.vertex = null;
      $scope.subtasks = null;
      $scope.accumulators = null;
      return $scope.$broadcast('reload');
    } else {
      $scope.nodeid = null;
      $scope.nodeUnfolded = false;
      $scope.vertex = null;
      $scope.subtasks = null;
      return $scope.accumulators = null;
    }
  };
  $scope.clearFiles = function() {
    return $scope.uploader = {};
  };
  $scope.uploadFiles = function(files) {
    $scope.uploader = {};
    if (files.length === 1) {
      $scope.uploader['file'] = files[0];
      return $scope.uploader['upload'] = true;
    } else {
      return $scope.uploader['error'] = "Did ya forget to select a file?";
    }
  };
  return $scope.startUpload = function() {
    var formdata, xhr;
    if ($scope.uploader['file'] != null) {
      formdata = new FormData();
      formdata.append("jarfile", $scope.uploader['file']);
      $scope.uploader['upload'] = false;
      $scope.uploader['success'] = "Initializing upload...";
      xhr = new XMLHttpRequest();
      xhr.upload.onprogress = function(event) {
        $scope.uploader['success'] = null;
        return $scope.uploader['progress'] = parseInt(100 * event.loaded / event.total);
      };
      xhr.upload.onerror = function(event) {
        $scope.uploader['progress'] = null;
        return $scope.uploader['error'] = "An error occurred while uploading your file";
      };
      xhr.upload.onload = function(event) {
        $scope.uploader['progress'] = null;
        return $scope.uploader['success'] = "Saving...";
      };
      xhr.onreadystatechange = function() {
        var response;
        if (xhr.readyState === 4) {
          response = JSON.parse(xhr.responseText);
          if (response.error != null) {
            $scope.uploader['error'] = response.error;
            return $scope.uploader['success'] = null;
          } else {
            return $scope.uploader['success'] = "Uploaded!";
          }
        }
      };
      xhr.open("POST", "/jars/upload");
      return xhr.send(formdata);
    } else {
      return console.log("Unexpected Error. This should not happen");
    }
  };
}]).filter('getJarSelectClass', function() {
  return function(selected, actual) {
    if (selected === actual) {
      return "fa-check-square";
    } else {
      return "fa-square-o";
    }
  };
});

angular.module('flinkApp').service('JobSubmitService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadJarList = function() {
    var deferred;
    deferred = $q.defer();
    $http.get("jars/").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.deleteJar = function(id) {
    var deferred;
    deferred = $q.defer();
    $http["delete"]("jars/" + id).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPlan = function(id, args) {
    var deferred;
    deferred = $q.defer();
    $http.get("jars/" + id + "/plan", {
      params: args
    }).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.runJob = function(id, args) {
    var deferred;
    deferred = $q.defer();
    $http.post("jars/" + id + "/run", {}, {
      params: args
    }).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('AllTaskManagersController', ["$scope", "TaskManagersService", "$interval", "flinkConfig", function($scope, TaskManagersService, $interval, flinkConfig) {
  var refresh;
  TaskManagersService.loadManagers().then(function(data) {
    return $scope.managers = data;
  });
  refresh = $interval(function() {
    return TaskManagersService.loadManagers().then(function(data) {
      return $scope.managers = data;
    });
  }, flinkConfig["refresh-interval"]);
  return $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
}]).controller('SingleTaskManagerController', ["$scope", "$stateParams", "SingleTaskManagerService", "$interval", "flinkConfig", function($scope, $stateParams, SingleTaskManagerService, $interval, flinkConfig) {
  var refresh;
  $scope.metrics = {};
  SingleTaskManagerService.loadMetrics($stateParams.taskmanagerid).then(function(data) {
    return $scope.metrics = data[0];
  });
  refresh = $interval(function() {
    return SingleTaskManagerService.loadMetrics($stateParams.taskmanagerid).then(function(data) {
      return $scope.metrics = data[0];
    });
  }, flinkConfig["refresh-interval"]);
  return $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
}]).controller('SingleTaskManagerLogsController', ["$scope", "$stateParams", "SingleTaskManagerService", "$interval", "flinkConfig", function($scope, $stateParams, SingleTaskManagerService, $interval, flinkConfig) {
  $scope.log = {};
  SingleTaskManagerService.loadLogs($stateParams.taskmanagerid).then(function(data) {
    return $scope.log = data;
  });
  $scope.reloadData = function() {
    return SingleTaskManagerService.loadLogs($stateParams.taskmanagerid).then(function(data) {
      return $scope.log = data;
    });
  };
  return $scope.downloadData = function() {
    return window.location.href = "/taskmanagers/" + $stateParams.taskmanagerid + "/log";
  };
}]).controller('SingleTaskManagerStdoutController', ["$scope", "$stateParams", "SingleTaskManagerService", "$interval", "flinkConfig", function($scope, $stateParams, SingleTaskManagerService, $interval, flinkConfig) {
  $scope.stdout = {};
  SingleTaskManagerService.loadStdout($stateParams.taskmanagerid).then(function(data) {
    return $scope.stdout = data;
  });
  $scope.reloadData = function() {
    return SingleTaskManagerService.loadStdout($stateParams.taskmanagerid).then(function(data) {
      return $scope.stdout = data;
    });
  };
  return $scope.downloadData = function() {
    return window.location.href = "/taskmanagers/" + $stateParams.taskmanagerid + "/stdout";
  };
}]);

angular.module('flinkApp').service('TaskManagersService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadManagers = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers").success(function(data, status, headers, config) {
      return deferred.resolve(data['taskmanagers']);
    });
    return deferred.promise;
  };
  return this;
}]).service('SingleTaskManagerService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadMetrics = function(taskmanagerid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers/" + taskmanagerid + "/metrics").success(function(data, status, headers, config) {
      return deferred.resolve(data['taskmanagers']);
    });
    return deferred.promise;
  };
  this.loadLogs = function(taskmanagerid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers/" + taskmanagerid + "/log").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.loadStdout = function(taskmanagerid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers/" + taskmanagerid + "/stdout").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsImluZGV4LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMuY29mZmVlIiwiY29tbW9uL2RpcmVjdGl2ZXMuanMiLCJjb21tb24vZmlsdGVycy5jb2ZmZWUiLCJjb21tb24vZmlsdGVycy5qcyIsImNvbW1vbi9zZXJ2aWNlcy5jb2ZmZWUiLCJjb21tb24vc2VydmljZXMuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvam9ibWFuYWdlci9qb2JtYW5hZ2VyLmN0cmwuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5zdmMuY29mZmVlIiwibW9kdWxlcy9qb2JtYW5hZ2VyL2pvYm1hbmFnZXIuc3ZjLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5jdHJsLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuZGlyLmNvZmZlZSIsIm1vZHVsZXMvam9icy9qb2JzLmRpci5qcyIsIm1vZHVsZXMvam9icy9qb2JzLnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5zdmMuanMiLCJtb2R1bGVzL2pvYnMvbWV0cmljcy5kaXIuY29mZmVlIiwibW9kdWxlcy9qb2JzL21ldHJpY3MuZGlyLmpzIiwibW9kdWxlcy9qb2JzL21ldHJpY3Muc3ZjLmNvZmZlZSIsIm1vZHVsZXMvam9icy9tZXRyaWNzLnN2Yy5qcyIsIm1vZHVsZXMvb3ZlcnZpZXcvb3ZlcnZpZXcuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LmN0cmwuanMiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5qcyIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmpzIiwibW9kdWxlcy9zdWJtaXQvc3VibWl0LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL3N1Ym1pdC9zdWJtaXQuc3ZjLmpzIiwibW9kdWxlcy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuY3RybC5qcyIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCQSxRQUFRLE9BQU8sWUFBWSxDQUFDLGFBQWEsaUJBQWlCLFFBQVEsYUFJakUsbUJBQUksU0FBQyxZQUFEO0VBQ0gsV0FBVyxpQkFBaUI7RUNyQjVCLE9Ec0JBLFdBQVcsY0FBYyxXQUFBO0lBQ3ZCLFdBQVcsaUJBQWlCLENBQUMsV0FBVztJQ3JCeEMsT0RzQkEsV0FBVyxlQUFlOztJQUk3QixNQUFNLGVBQWU7RUFFcEIsV0FBVztFQUNYLG9CQUFvQjtHQUtyQiwrREFBSSxTQUFDLGFBQWEsYUFBYSxhQUFhLFdBQXhDO0VDNUJILE9ENkJBLFlBQVksYUFBYSxLQUFLLFNBQUMsUUFBRDtJQUM1QixRQUFRLE9BQU8sYUFBYTtJQUk1QixZQUFZO0lDL0JaLE9EaUNBLFVBQVUsV0FBQTtNQ2hDUixPRGlDQSxZQUFZO09BQ1osWUFBWTs7SUFLakIsaUNBQU8sU0FBQyx1QkFBRDtFQ25DTixPRG9DQSxzQkFBc0I7SUFJdkIsNkJBQUksU0FBQyxZQUFZLFFBQWI7RUN0Q0gsT0R1Q0EsV0FBVyxJQUFJLHFCQUFxQixTQUFDLE9BQU8sU0FBUyxVQUFVLFdBQTNCO0lBQ2xDLElBQUcsUUFBUSxZQUFYO01BQ0UsTUFBTTtNQ3RDTixPRHVDQSxPQUFPLEdBQUcsUUFBUSxZQUFZOzs7SUFJbkMsZ0RBQU8sU0FBQyxnQkFBZ0Isb0JBQWpCO0VBQ04sZUFBZSxNQUFNLFlBQ25CO0lBQUEsS0FBSztJQUNMLE9BQ0U7TUFBQSxNQUNFO1FBQUEsYUFBYTtRQUNiLFlBQVk7OztLQUVqQixN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QUFEO0lBQ1YsSUFBQTtJQUFBLFdBQVcsR0FBRztJQUVkLE1BQU0sSUFBSSxZQUFZLFlBQVksa0JBQWtCLGdCQUFnQixRQUNuRSxRQUFRLFNBQUMsTUFBTSxRQUFRLFNBQVMsUUFBeEI7TUN2QlAsT0R3QkEsU0FBUyxRQUFROztJQ3RCbkIsT0R3QkEsU0FBUzs7RUFFWCxLQUFDLGFBQWEsU0FBQyxlQUFEO0lBQ1osSUFBQTtJQUFBLFdBQVcsR0FBRztJQUVkLE1BQU0sSUFBSSxZQUFZLFlBQVksa0JBQWtCLGdCQUFnQixXQUNuRSxRQUFRLFNBQUMsTUFBTSxRQUFRLFNBQVMsUUFBeEI7TUN4QlAsT0R5QkEsU0FBUyxRQUFROztJQ3ZCbkIsT0R5QkEsU0FBUzs7RUN2QlgsT0R5QkE7O0FDdkJGIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcsIFsndWkucm91dGVyJywgJ2FuZ3VsYXJNb21lbnQnLCAnbnZkMycsICdkbmRMaXN0cyddKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5ydW4gKCRyb290U2NvcGUpIC0+XG4gICRyb290U2NvcGUuc2lkZWJhclZpc2libGUgPSBmYWxzZVxuICAkcm9vdFNjb3BlLnNob3dTaWRlYmFyID0gLT5cbiAgICAkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlID0gISRyb290U2NvcGUuc2lkZWJhclZpc2libGVcbiAgICAkcm9vdFNjb3BlLnNpZGViYXJDbGFzcyA9ICdmb3JjZS1zaG93J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi52YWx1ZSAnZmxpbmtDb25maWcnLCB7XG4jICBqb2JTZXJ2ZXI6ICcnXG4gIGpvYlNlcnZlcjogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MS8nXG4gIFwicmVmcmVzaC1pbnRlcnZhbFwiOiAxMDAwMFxufVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5ydW4gKEpvYnNTZXJ2aWNlLCBNYWluU2VydmljZSwgZmxpbmtDb25maWcsICRpbnRlcnZhbCkgLT5cbiAgTWFpblNlcnZpY2UubG9hZENvbmZpZygpLnRoZW4gKGNvbmZpZykgLT5cbiAgICBhbmd1bGFyLmV4dGVuZCBmbGlua0NvbmZpZywgY29uZmlnXG4jICAgIGNvbnNvbGUubG9nIGZsaW5rQ29uZmlnXG4jICAgIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSA9IDIwMDAwXG5cbiAgICBKb2JzU2VydmljZS5saXN0Sm9icygpXG5cbiAgICAkaW50ZXJ2YWwgLT5cbiAgICAgIEpvYnNTZXJ2aWNlLmxpc3RKb2JzKClcbiAgICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbmZpZyAoJHVpVmlld1Njcm9sbFByb3ZpZGVyKSAtPlxuICAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4ucnVuICgkcm9vdFNjb3BlLCAkc3RhdGUpIC0+XG4gICRyb290U2NvcGUuJG9uICckc3RhdGVDaGFuZ2VTdGFydCcsIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSkgLT5cbiAgICBpZiB0b1N0YXRlLnJlZGlyZWN0VG9cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICRzdGF0ZS5nbyB0b1N0YXRlLnJlZGlyZWN0VG8sIHRvUGFyYW1zXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbmZpZyAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikgLT5cbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUgXCJvdmVydmlld1wiLFxuICAgIHVybDogXCIvb3ZlcnZpZXdcIlxuICAgIHZpZXdzOlxuICAgICAgbWFpbjpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvb3ZlcnZpZXcuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdPdmVydmlld0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwicnVubmluZy1qb2JzXCIsXG4gICAgdXJsOiBcIi9ydW5uaW5nLWpvYnNcIlxuICAgIHZpZXdzOlxuICAgICAgbWFpbjpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9ydW5uaW5nLWpvYnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSdW5uaW5nSm9ic0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwiY29tcGxldGVkLWpvYnNcIixcbiAgICB1cmw6IFwiL2NvbXBsZXRlZC1qb2JzXCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvY29tcGxldGVkLWpvYnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iXCIsXG4gICAgdXJsOiBcIi9qb2JzL3tqb2JpZH1cIlxuICAgIGFic3RyYWN0OiB0cnVlXG4gICAgdmlld3M6XG4gICAgICBtYWluOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZUpvYkNvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuXCIsXG4gICAgdXJsOiBcIlwiXG4gICAgcmVkaXJlY3RUbzogXCJzaW5nbGUtam9iLnBsYW4uc3VidGFza3NcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5Db250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiLFxuICAgIHVybDogXCJcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LnN1YnRhc2tzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4ubWV0cmljc1wiLFxuICAgIHVybDogXCIvbWV0cmljc1wiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QubWV0cmljcy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5NZXRyaWNzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4udGFza21hbmFnZXJzXCIsXG4gICAgdXJsOiBcIi90YXNrbWFuYWdlcnNcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LnRhc2ttYW5hZ2Vycy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5UYXNrTWFuYWdlcnNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5hY2N1bXVsYXRvcnNcIixcbiAgICB1cmw6IFwiL2FjY3VtdWxhdG9yc1wiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYWNjdW11bGF0b3JzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzXCIsXG4gICAgdXJsOiBcIi9jaGVja3BvaW50c1wiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuY2hlY2twb2ludHMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5iYWNrcHJlc3N1cmVcIixcbiAgICB1cmw6IFwiL2JhY2twcmVzc3VyZVwiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYmFja3ByZXNzdXJlLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi50aW1lbGluZVwiLFxuICAgIHVybDogXCIvdGltZWxpbmVcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUuaHRtbFwiXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi50aW1lbGluZS52ZXJ0ZXhcIixcbiAgICB1cmw6IFwiL3t2ZXJ0ZXhJZH1cIlxuICAgIHZpZXdzOlxuICAgICAgdmVydGV4OlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi50aW1lbGluZS52ZXJ0ZXguaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5leGNlcHRpb25zXCIsXG4gICAgdXJsOiBcIi9leGNlcHRpb25zXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmV4Y2VwdGlvbnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLmNvbmZpZ1wiLFxuICAgIHVybDogXCIvY29uZmlnXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmNvbmZpZy5odG1sXCJcblxuICAuc3RhdGUgXCJhbGwtbWFuYWdlclwiLFxuICAgIHVybDogXCIvdGFza21hbmFnZXJzXCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL2luZGV4Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtbWFuYWdlclwiLFxuICAgICAgdXJsOiBcIi90YXNrbWFuYWdlci97dGFza21hbmFnZXJpZH1cIlxuICAgICAgdmlld3M6XG4gICAgICAgIG1haW46XG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuaHRtbFwiXG5cbiAgLnN0YXRlIFwic2luZ2xlLW1hbmFnZXIubWV0cmljc1wiLFxuICAgIHVybDogXCIvbWV0cmljc1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5tZXRyaWNzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlVGFza01hbmFnZXJDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1tYW5hZ2VyLnN0ZG91dFwiLFxuICAgIHVybDogXCIvc3Rkb3V0XCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLnN0ZG91dC5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZVRhc2tNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtbWFuYWdlci5sb2dcIixcbiAgICB1cmw6IFwiL2xvZ1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5sb2cuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlckxvZ3NDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcImpvYm1hbmFnZXJcIixcbiAgICAgIHVybDogXCIvam9ibWFuYWdlclwiXG4gICAgICB2aWV3czpcbiAgICAgICAgbWFpbjpcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL2luZGV4Lmh0bWxcIlxuXG4gIC5zdGF0ZSBcImpvYm1hbmFnZXIuY29uZmlnXCIsXG4gICAgdXJsOiBcIi9jb25maWdcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9jb25maWcuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JNYW5hZ2VyQ29uZmlnQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJqb2JtYW5hZ2VyLnN0ZG91dFwiLFxuICAgIHVybDogXCIvc3Rkb3V0XCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvc3Rkb3V0Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwiam9ibWFuYWdlci5sb2dcIixcbiAgICB1cmw6IFwiL2xvZ1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL2xvZy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzdWJtaXRcIixcbiAgICAgIHVybDogXCIvc3VibWl0XCJcbiAgICAgIHZpZXdzOlxuICAgICAgICBtYWluOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3N1Ym1pdC5odG1sXCJcbiAgICAgICAgICBjb250cm9sbGVyOiBcIkpvYlN1Ym1pdENvbnRyb2xsZXJcIlxuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UgXCIvb3ZlcnZpZXdcIlxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJywgWyd1aS5yb3V0ZXInLCAnYW5ndWxhck1vbWVudCcsICdudmQzJywgJ2RuZExpc3RzJ10pLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuc2lkZWJhclZpc2libGUgPSBmYWxzZTtcbiAgcmV0dXJuICRyb290U2NvcGUuc2hvd1NpZGViYXIgPSBmdW5jdGlvbigpIHtcbiAgICAkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlID0gISRyb290U2NvcGUuc2lkZWJhclZpc2libGU7XG4gICAgcmV0dXJuICRyb290U2NvcGUuc2lkZWJhckNsYXNzID0gJ2ZvcmNlLXNob3cnO1xuICB9O1xufSkudmFsdWUoJ2ZsaW5rQ29uZmlnJywge1xuICBqb2JTZXJ2ZXI6ICdodHRwOi8vbG9jYWxob3N0OjgwODEvJyxcbiAgXCJyZWZyZXNoLWludGVydmFsXCI6IDEwMDAwXG59KS5ydW4oZnVuY3Rpb24oSm9ic1NlcnZpY2UsIE1haW5TZXJ2aWNlLCBmbGlua0NvbmZpZywgJGludGVydmFsKSB7XG4gIHJldHVybiBNYWluU2VydmljZS5sb2FkQ29uZmlnKCkudGhlbihmdW5jdGlvbihjb25maWcpIHtcbiAgICBhbmd1bGFyLmV4dGVuZChmbGlua0NvbmZpZywgY29uZmlnKTtcbiAgICBKb2JzU2VydmljZS5saXN0Sm9icygpO1xuICAgIHJldHVybiAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gSm9ic1NlcnZpY2UubGlzdEpvYnMoKTtcbiAgICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICB9KTtcbn0pLmNvbmZpZyhmdW5jdGlvbigkdWlWaWV3U2Nyb2xsUHJvdmlkZXIpIHtcbiAgcmV0dXJuICR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKTtcbn0pLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUpIHtcbiAgcmV0dXJuICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlKSB7XG4gICAgaWYgKHRvU3RhdGUucmVkaXJlY3RUbykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiAkc3RhdGUuZ28odG9TdGF0ZS5yZWRpcmVjdFRvLCB0b1BhcmFtcyk7XG4gICAgfVxuICB9KTtcbn0pLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwib3ZlcnZpZXdcIiwge1xuICAgIHVybDogXCIvb3ZlcnZpZXdcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9vdmVydmlldy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdPdmVydmlld0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInJ1bm5pbmctam9ic1wiLCB7XG4gICAgdXJsOiBcIi9ydW5uaW5nLWpvYnNcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL3J1bm5pbmctam9icy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSdW5uaW5nSm9ic0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImNvbXBsZXRlZC1qb2JzXCIsIHtcbiAgICB1cmw6IFwiL2NvbXBsZXRlZC1qb2JzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9jb21wbGV0ZWQtam9icy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYlwiLCB7XG4gICAgdXJsOiBcIi9qb2JzL3tqb2JpZH1cIixcbiAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVKb2JDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW5cIiwge1xuICAgIHVybDogXCJcIixcbiAgICByZWRpcmVjdFRvOiBcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4uaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiLCB7XG4gICAgdXJsOiBcIlwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbm9kZS1kZXRhaWxzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5zdWJ0YXNrcy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4ubWV0cmljc1wiLCB7XG4gICAgdXJsOiBcIi9tZXRyaWNzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0Lm1ldHJpY3MuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4udGFza21hbmFnZXJzXCIsIHtcbiAgICB1cmw6IFwiL3Rhc2ttYW5hZ2Vyc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbm9kZS1kZXRhaWxzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC50YXNrbWFuYWdlcnMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5hY2N1bXVsYXRvcnNcIiwge1xuICAgIHVybDogXCIvYWNjdW11bGF0b3JzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmFjY3VtdWxhdG9ycy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzXCIsIHtcbiAgICB1cmw6IFwiL2NoZWNrcG9pbnRzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmNoZWNrcG9pbnRzLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5iYWNrcHJlc3N1cmVcIiwge1xuICAgIHVybDogXCIvYmFja3ByZXNzdXJlXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmJhY2twcmVzc3VyZS5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQmFja1ByZXNzdXJlQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi50aW1lbGluZVwiLCB7XG4gICAgdXJsOiBcIi90aW1lbGluZVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnRpbWVsaW5lLmh0bWxcIlxuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnRpbWVsaW5lLnZlcnRleFwiLCB7XG4gICAgdXJsOiBcIi97dmVydGV4SWR9XCIsXG4gICAgdmlld3M6IHtcbiAgICAgIHZlcnRleDoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi50aW1lbGluZS52ZXJ0ZXguaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLmV4Y2VwdGlvbnNcIiwge1xuICAgIHVybDogXCIvZXhjZXB0aW9uc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmV4Y2VwdGlvbnMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IuY29uZmlnXCIsIHtcbiAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmNvbmZpZy5odG1sXCJcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwiYWxsLW1hbmFnZXJcIiwge1xuICAgIHVybDogXCIvdGFza21hbmFnZXJzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvaW5kZXguaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLW1hbmFnZXJcIiwge1xuICAgIHVybDogXCIvdGFza21hbmFnZXIve3Rhc2ttYW5hZ2VyaWR9XCIsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1tYW5hZ2VyLm1ldHJpY3NcIiwge1xuICAgIHVybDogXCIvbWV0cmljc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLm1ldHJpY3MuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlVGFza01hbmFnZXJDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtbWFuYWdlci5zdGRvdXRcIiwge1xuICAgIHVybDogXCIvc3Rkb3V0XCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3Rkb3V0Lmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZVRhc2tNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLW1hbmFnZXIubG9nXCIsIHtcbiAgICB1cmw6IFwiL2xvZ1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLmxvZy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlckxvZ3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJqb2JtYW5hZ2VyXCIsIHtcbiAgICB1cmw6IFwiL2pvYm1hbmFnZXJcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL2luZGV4Lmh0bWxcIlxuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJqb2JtYW5hZ2VyLmNvbmZpZ1wiLCB7XG4gICAgdXJsOiBcIi9jb25maWdcIixcbiAgICB2aWV3czoge1xuICAgICAgZGV0YWlsczoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL2NvbmZpZy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JNYW5hZ2VyQ29uZmlnQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwiam9ibWFuYWdlci5zdGRvdXRcIiwge1xuICAgIHVybDogXCIvc3Rkb3V0XCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9zdGRvdXQuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImpvYm1hbmFnZXIubG9nXCIsIHtcbiAgICB1cmw6IFwiL2xvZ1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvbG9nLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic3VibWl0XCIsIHtcbiAgICB1cmw6IFwiL3N1Ym1pdFwiLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3N1Ym1pdC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiSm9iU3VibWl0Q29udHJvbGxlclwiXG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvb3ZlcnZpZXdcIik7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAnYnNMYWJlbCcsIChKb2JzU2VydmljZSkgLT5cbiAgdHJhbnNjbHVkZTogdHJ1ZVxuICByZXBsYWNlOiB0cnVlXG4gIHNjb3BlOiBcbiAgICBnZXRMYWJlbENsYXNzOiBcIiZcIlxuICAgIHN0YXR1czogXCJAXCJcblxuICB0ZW1wbGF0ZTogXCI8c3BhbiB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldExhYmVsQ2xhc3MoKSc+PG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPjwvc3Bhbj5cIlxuICBcbiAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cbiAgICBzY29wZS5nZXRMYWJlbENsYXNzID0gLT5cbiAgICAgICdsYWJlbCBsYWJlbC0nICsgSm9ic1NlcnZpY2UudHJhbnNsYXRlTGFiZWxTdGF0ZShhdHRycy5zdGF0dXMpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdicExhYmVsJywgKEpvYnNTZXJ2aWNlKSAtPlxuICB0cmFuc2NsdWRlOiB0cnVlXG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6XG4gICAgZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzczogXCImXCJcbiAgICBzdGF0dXM6IFwiQFwiXG5cbiAgdGVtcGxhdGU6IFwiPHNwYW4gdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzKCknPjxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT48L3NwYW4+XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmdldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3MgPSAtPlxuICAgICAgJ2xhYmVsIGxhYmVsLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVCYWNrUHJlc3N1cmVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ2luZGljYXRvclByaW1hcnknLCAoSm9ic1NlcnZpY2UpIC0+XG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6IFxuICAgIGdldExhYmVsQ2xhc3M6IFwiJlwiXG4gICAgc3RhdHVzOiAnQCdcblxuICB0ZW1wbGF0ZTogXCI8aSB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldExhYmVsQ2xhc3MoKScgLz5cIlxuICBcbiAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cbiAgICBzY29wZS5nZXRMYWJlbENsYXNzID0gLT5cbiAgICAgICdmYSBmYS1jaXJjbGUgaW5kaWNhdG9yIGluZGljYXRvci0nICsgSm9ic1NlcnZpY2UudHJhbnNsYXRlTGFiZWxTdGF0ZShhdHRycy5zdGF0dXMpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICd0YWJsZVByb3BlcnR5JywgLT5cbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTpcbiAgICB2YWx1ZTogJz0nXG5cbiAgdGVtcGxhdGU6IFwiPHRkIHRpdGxlPVxcXCJ7e3ZhbHVlIHx8ICdOb25lJ319XFxcIj57e3ZhbHVlIHx8ICdOb25lJ319PC90ZD5cIlxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuZGlyZWN0aXZlKCdic0xhYmVsJywgZnVuY3Rpb24oSm9ic1NlcnZpY2UpIHtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGdldExhYmVsQ2xhc3M6IFwiJlwiLFxuICAgICAgc3RhdHVzOiBcIkBcIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiPHNwYW4gdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRMYWJlbENsYXNzKCknPjxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT48L3NwYW4+XCIsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gc2NvcGUuZ2V0TGFiZWxDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2xhYmVsIGxhYmVsLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cyk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnYnBMYWJlbCcsIGZ1bmN0aW9uKEpvYnNTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBnZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzOiBcIiZcIixcbiAgICAgIHN0YXR1czogXCJAXCJcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBcIjxzcGFuIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzcygpJz48bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+PC9zcGFuPlwiLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgcmV0dXJuIHNjb3BlLmdldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICdsYWJlbCBsYWJlbC0nICsgSm9ic1NlcnZpY2UudHJhbnNsYXRlQmFja1ByZXNzdXJlTGFiZWxTdGF0ZShhdHRycy5zdGF0dXMpO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ2luZGljYXRvclByaW1hcnknLCBmdW5jdGlvbihKb2JzU2VydmljZSkge1xuICByZXR1cm4ge1xuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGdldExhYmVsQ2xhc3M6IFwiJlwiLFxuICAgICAgc3RhdHVzOiAnQCdcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBcIjxpIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0TGFiZWxDbGFzcygpJyAvPlwiLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgcmV0dXJuIHNjb3BlLmdldExhYmVsQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICdmYSBmYS1jaXJjbGUgaW5kaWNhdG9yIGluZGljYXRvci0nICsgSm9ic1NlcnZpY2UudHJhbnNsYXRlTGFiZWxTdGF0ZShhdHRycy5zdGF0dXMpO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ3RhYmxlUHJvcGVydHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICB2YWx1ZTogJz0nXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogXCI8dGQgdGl0bGU9XFxcInt7dmFsdWUgfHwgJ05vbmUnfX1cXFwiPnt7dmFsdWUgfHwgJ05vbmUnfX08L3RkPlwiXG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uZmlsdGVyIFwiYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkXCIsIChhbmd1bGFyTW9tZW50Q29uZmlnKSAtPlxuICBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXIgPSAodmFsdWUsIGZvcm1hdCwgZHVyYXRpb25Gb3JtYXQpIC0+XG4gICAgcmV0dXJuIFwiXCIgIGlmIHR5cGVvZiB2YWx1ZSBpcyBcInVuZGVmaW5lZFwiIG9yIHZhbHVlIGlzIG51bGxcblxuICAgIG1vbWVudC5kdXJhdGlvbih2YWx1ZSwgZm9ybWF0KS5mb3JtYXQoZHVyYXRpb25Gb3JtYXQsIHsgdHJpbTogZmFsc2UgfSlcblxuICBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXIuJHN0YXRlZnVsID0gYW5ndWxhck1vbWVudENvbmZpZy5zdGF0ZWZ1bEZpbHRlcnNcblxuICBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXJcblxuLmZpbHRlciBcImh1bWFuaXplRHVyYXRpb25cIiwgLT5cbiAgKHZhbHVlLCBzaG9ydCkgLT5cbiAgICByZXR1cm4gXCJcIiBpZiB0eXBlb2YgdmFsdWUgaXMgXCJ1bmRlZmluZWRcIiBvciB2YWx1ZSBpcyBudWxsXG4gICAgbXMgPSB2YWx1ZSAlIDEwMDBcbiAgICB4ID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwMDApXG4gICAgc2Vjb25kcyA9IHggJSA2MFxuICAgIHggPSBNYXRoLmZsb29yKHggLyA2MClcbiAgICBtaW51dGVzID0geCAlIDYwXG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDYwKVxuICAgIGhvdXJzID0geCAlIDI0XG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDI0KVxuICAgIGRheXMgPSB4XG4gICAgaWYgZGF5cyA9PSAwXG4gICAgICBpZiBob3VycyA9PSAwXG4gICAgICAgIGlmIG1pbnV0ZXMgPT0gMFxuICAgICAgICAgIGlmIHNlY29uZHMgPT0gMFxuICAgICAgICAgICAgcmV0dXJuIG1zICsgXCJtc1wiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHNlY29uZHMgKyBcInMgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHNob3J0IHRoZW4gcmV0dXJuIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibVwiIGVsc2UgcmV0dXJuIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIlxuICAgIGVsc2VcbiAgICAgIGlmIHNob3J0IHRoZW4gcmV0dXJuIGRheXMgKyBcImQgXCIgKyBob3VycyArIFwiaFwiIGVsc2UgcmV0dXJuIGRheXMgKyBcImQgXCIgKyBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCJcblxuLmZpbHRlciBcImh1bWFuaXplVGV4dFwiLCAtPlxuICAodGV4dCkgLT5cbiAgICAjIFRPRE86IGV4dGVuZC4uLiBhIGxvdFxuICAgIGlmIHRleHQgdGhlbiB0ZXh0LnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLzxiclxcLz4vZyxcIlwiKSBlbHNlICcnXG5cbi5maWx0ZXIgXCJodW1hbml6ZUJ5dGVzXCIsIC0+XG4gIChieXRlcykgLT5cbiAgICB1bml0cyA9IFtcIkJcIiwgXCJLQlwiLCBcIk1CXCIsIFwiR0JcIiwgXCJUQlwiLCBcIlBCXCIsIFwiRUJcIl1cbiAgICBjb252ZXJ0ZXIgPSAodmFsdWUsIHBvd2VyKSAtPlxuICAgICAgYmFzZSA9IE1hdGgucG93KDEwMjQsIHBvd2VyKVxuICAgICAgaWYgdmFsdWUgPCBiYXNlXG4gICAgICAgIHJldHVybiAodmFsdWUgLyBiYXNlKS50b0ZpeGVkKDIpICsgXCIgXCIgKyB1bml0c1twb3dlcl1cbiAgICAgIGVsc2UgaWYgdmFsdWUgPCBiYXNlICogMTAwMFxuICAgICAgICByZXR1cm4gKHZhbHVlIC8gYmFzZSkudG9QcmVjaXNpb24oMykgKyBcIiBcIiArIHVuaXRzW3Bvd2VyXVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBwb3dlciArIDEpXG4gICAgcmV0dXJuIFwiXCIgaWYgdHlwZW9mIGJ5dGVzIGlzIFwidW5kZWZpbmVkXCIgb3IgYnl0ZXMgaXMgbnVsbFxuICAgIGlmIGJ5dGVzIDwgMTAwMCB0aGVuIGJ5dGVzICsgXCIgQlwiIGVsc2UgY29udmVydGVyKGJ5dGVzLCAxKVxuXG4uZmlsdGVyIFwidG9VcHBlckNhc2VcIiwgLT5cbiAgKHRleHQpIC0+IHRleHQudG9VcHBlckNhc2UoKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuZmlsdGVyKFwiYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkXCIsIGZ1bmN0aW9uKGFuZ3VsYXJNb21lbnRDb25maWcpIHtcbiAgdmFyIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlcjtcbiAgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyID0gZnVuY3Rpb24odmFsdWUsIGZvcm1hdCwgZHVyYXRpb25Gb3JtYXQpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgcmV0dXJuIG1vbWVudC5kdXJhdGlvbih2YWx1ZSwgZm9ybWF0KS5mb3JtYXQoZHVyYXRpb25Gb3JtYXQsIHtcbiAgICAgIHRyaW06IGZhbHNlXG4gICAgfSk7XG4gIH07XG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlci4kc3RhdGVmdWwgPSBhbmd1bGFyTW9tZW50Q29uZmlnLnN0YXRlZnVsRmlsdGVycztcbiAgcmV0dXJuIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlcjtcbn0pLmZpbHRlcihcImh1bWFuaXplRHVyYXRpb25cIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgc2hvcnQpIHtcbiAgICB2YXIgZGF5cywgaG91cnMsIG1pbnV0ZXMsIG1zLCBzZWNvbmRzLCB4O1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBtcyA9IHZhbHVlICUgMTAwMDtcbiAgICB4ID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwMDApO1xuICAgIHNlY29uZHMgPSB4ICUgNjA7XG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDYwKTtcbiAgICBtaW51dGVzID0geCAlIDYwO1xuICAgIHggPSBNYXRoLmZsb29yKHggLyA2MCk7XG4gICAgaG91cnMgPSB4ICUgMjQ7XG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDI0KTtcbiAgICBkYXlzID0geDtcbiAgICBpZiAoZGF5cyA9PT0gMCkge1xuICAgICAgaWYgKGhvdXJzID09PSAwKSB7XG4gICAgICAgIGlmIChtaW51dGVzID09PSAwKSB7XG4gICAgICAgICAgaWYgKHNlY29uZHMgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBtcyArIFwibXNcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlY29uZHMgKyBcInMgXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2hvcnQpIHtcbiAgICAgICAgICByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc2hvcnQpIHtcbiAgICAgICAgcmV0dXJuIGRheXMgKyBcImQgXCIgKyBob3VycyArIFwiaFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRheXMgKyBcImQgXCIgKyBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCI7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSkuZmlsdGVyKFwiaHVtYW5pemVUZXh0XCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuICAgIGlmICh0ZXh0KSB7XG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC88YnJcXC8+L2csIFwiXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9O1xufSkuZmlsdGVyKFwiaHVtYW5pemVCeXRlc1wiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgdmFyIGNvbnZlcnRlciwgdW5pdHM7XG4gICAgdW5pdHMgPSBbXCJCXCIsIFwiS0JcIiwgXCJNQlwiLCBcIkdCXCIsIFwiVEJcIiwgXCJQQlwiLCBcIkVCXCJdO1xuICAgIGNvbnZlcnRlciA9IGZ1bmN0aW9uKHZhbHVlLCBwb3dlcikge1xuICAgICAgdmFyIGJhc2U7XG4gICAgICBiYXNlID0gTWF0aC5wb3coMTAyNCwgcG93ZXIpO1xuICAgICAgaWYgKHZhbHVlIDwgYmFzZSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlIC8gYmFzZSkudG9GaXhlZCgyKSArIFwiIFwiICsgdW5pdHNbcG93ZXJdO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IGJhc2UgKiAxMDAwKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgLyBiYXNlKS50b1ByZWNpc2lvbigzKSArIFwiIFwiICsgdW5pdHNbcG93ZXJdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSwgcG93ZXIgKyAxKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmICh0eXBlb2YgYnl0ZXMgPT09IFwidW5kZWZpbmVkXCIgfHwgYnl0ZXMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAoYnl0ZXMgPCAxMDAwKSB7XG4gICAgICByZXR1cm4gYnl0ZXMgKyBcIiBCXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb252ZXJ0ZXIoYnl0ZXMsIDEpO1xuICAgIH1cbiAgfTtcbn0pLmZpbHRlcihcInRvVXBwZXJDYXNlXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvVXBwZXJDYXNlKCk7XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnTWFpblNlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgQGxvYWRDb25maWcgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiY29uZmlnXCJcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdNYWluU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkQ29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJjb25maWdcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJDb25maWdDb250cm9sbGVyJywgKCRzY29wZSwgSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuIChkYXRhKSAtPlxuICAgIGlmICEkc2NvcGUuam9ibWFuYWdlcj9cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge31cbiAgICAkc2NvcGUuam9ibWFuYWdlclsnY29uZmlnJ10gPSBkYXRhXG5cbi5jb250cm9sbGVyICdKb2JNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4gKGRhdGEpIC0+XG4gICAgaWYgISRzY29wZS5qb2JtYW5hZ2VyP1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fVxuICAgICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlLmxvYWRMb2dzKCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGFcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJTdGRvdXRDb250cm9sbGVyJywgKCRzY29wZSwgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuIChkYXRhKSAtPlxuICAgIGlmICEkc2NvcGUuam9ibWFuYWdlcj9cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge31cbiAgICAkc2NvcGUuam9ibWFuYWdlclsnc3Rkb3V0J10gPSBkYXRhXG5cbiAgJHNjb3BlLnJlbG9hZERhdGEgPSAoKSAtPlxuICAgIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmpvYm1hbmFnZXJbJ3N0ZG91dCddID0gZGF0YVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignSm9iTWFuYWdlckNvbmZpZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlKSB7XG4gIHJldHVybiBKb2JNYW5hZ2VyQ29uZmlnU2VydmljZS5sb2FkQ29uZmlnKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCRzY29wZS5qb2JtYW5hZ2VyID09IG51bGwpIHtcbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge307XG4gICAgfVxuICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnY29uZmlnJ10gPSBkYXRhO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlKSB7XG4gIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICgkc2NvcGUuam9ibWFuYWdlciA9PSBudWxsKSB7XG4gICAgICAkc2NvcGUuam9ibWFuYWdlciA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gJHNjb3BlLmpvYm1hbmFnZXJbJ2xvZyddID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUucmVsb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UubG9hZExvZ3MoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnbG9nJ10gPSBkYXRhO1xuICAgIH0pO1xuICB9O1xufSkuY29udHJvbGxlcignSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlKSB7XG4gIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoJHNjb3BlLmpvYm1hbmFnZXIgPT0gbnVsbCkge1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLnJlbG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UubG9hZFN0ZG91dCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgY29uZmlnID0ge31cblxuICBAbG9hZENvbmZpZyA9IC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2NvbmZpZ1wiKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGNvbmZpZyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyTG9nc1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgbG9ncyA9IHt9XG5cbiAgQGxvYWRMb2dzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvbG9nXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgbG9ncyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyU3Rkb3V0U2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBzdGRvdXQgPSB7fVxuXG4gIEBsb2FkU3Rkb3V0ID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvc3Rkb3V0XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgc3Rkb3V0ID0gZGF0YVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ0pvYk1hbmFnZXJDb25maWdTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgY29uZmlnO1xuICBjb25maWcgPSB7fTtcbiAgdGhpcy5sb2FkQ29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBjb25maWcgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnSm9iTWFuYWdlckxvZ3NTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgbG9ncztcbiAgbG9ncyA9IHt9O1xuICB0aGlzLmxvYWRMb2dzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2xvZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBsb2dzID0gZGF0YTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pLnNlcnZpY2UoJ0pvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgc3Rkb3V0O1xuICBzdGRvdXQgPSB7fTtcbiAgdGhpcy5sb2FkU3Rkb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL3N0ZG91dFwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBzdGRvdXQgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ1J1bm5pbmdKb2JzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gLT5cbiAgICAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKVxuXG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcblxuICAkc2NvcGUuam9iT2JzZXJ2ZXIoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gLT5cbiAgICAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJylcblxuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG5cbiAgJHNjb3BlLmpvYk9ic2VydmVyKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnU2luZ2xlSm9iQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSwgJHJvb3RTY29wZSwgZmxpbmtDb25maWcsICRpbnRlcnZhbCkgLT5cbiAgY29uc29sZS5sb2cgJ1NpbmdsZUpvYkNvbnRyb2xsZXInXG5cbiAgJHNjb3BlLmpvYmlkID0gJHN0YXRlUGFyYW1zLmpvYmlkXG4gICRzY29wZS5qb2IgPSBudWxsXG4gICRzY29wZS5wbGFuID0gbnVsbFxuICAkc2NvcGUudmVydGljZXMgPSBudWxsXG4gICRzY29wZS5qb2JDaGVja3BvaW50U3RhdHMgPSBudWxsXG4gICRzY29wZS5zaG93SGlzdG9yeSA9IGZhbHNlXG4gICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzID0ge31cblxuICBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUuam9iID0gZGF0YVxuICAgICRzY29wZS5wbGFuID0gZGF0YS5wbGFuXG4gICAgJHNjb3BlLnZlcnRpY2VzID0gZGF0YS52ZXJ0aWNlc1xuXG4gIHJlZnJlc2hlciA9ICRpbnRlcnZhbCAtPlxuICAgIEpvYnNTZXJ2aWNlLmxvYWRKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmpvYiA9IGRhdGFcblxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkc2NvcGUuam9iID0gbnVsbFxuICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICRzY29wZS52ZXJ0aWNlcyA9IG51bGxcbiAgICAkc2NvcGUuam9iQ2hlY2twb2ludFN0YXRzID0gbnVsbFxuICAgICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzID0gbnVsbFxuXG4gICAgJGludGVydmFsLmNhbmNlbChyZWZyZXNoZXIpXG5cbiAgJHNjb3BlLmNhbmNlbEpvYiA9IChjYW5jZWxFdmVudCkgLT5cbiAgICBhbmd1bGFyLmVsZW1lbnQoY2FuY2VsRXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJidG5cIikucmVtb3ZlQ2xhc3MoXCJidG4tZGVmYXVsdFwiKS5odG1sKCdDYW5jZWxsaW5nLi4uJylcbiAgICBKb2JzU2VydmljZS5jYW5jZWxKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAge31cblxuICAkc2NvcGUuc3RvcEpvYiA9IChzdG9wRXZlbnQpIC0+XG4gICAgYW5ndWxhci5lbGVtZW50KHN0b3BFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ1N0b3BwaW5nLi4uJylcbiAgICBKb2JzU2VydmljZS5zdG9wSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgIHt9XG5cbiAgJHNjb3BlLnRvZ2dsZUhpc3RvcnkgPSAtPlxuICAgICRzY29wZS5zaG93SGlzdG9yeSA9ICEkc2NvcGUuc2hvd0hpc3RvcnlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbkNvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIC0+XG4gIGNvbnNvbGUubG9nICdKb2JQbGFuQ29udHJvbGxlcidcblxuICAkc2NvcGUubm9kZWlkID0gbnVsbFxuICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2VcbiAgJHNjb3BlLnN0YXRlTGlzdCA9IEpvYnNTZXJ2aWNlLnN0YXRlTGlzdCgpXG5cbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSAobm9kZWlkKSAtPlxuICAgIGlmIG5vZGVpZCAhPSAkc2NvcGUubm9kZWlkXG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkXG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcbiAgICAgICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IG51bGxcblxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAgIGVsc2VcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2VcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbFxuXG4gICRzY29wZS5kZWFjdGl2YXRlTm9kZSA9IC0+XG4gICAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2VcbiAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGxcbiAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuICAgICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IG51bGxcblxuICAkc2NvcGUudG9nZ2xlRm9sZCA9IC0+XG4gICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9ICEkc2NvcGUubm9kZVVuZm9sZGVkXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5TdWJ0YXNrc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSkgLT5cbiAgY29uc29sZS5sb2cgJ0pvYlBsYW5TdWJ0YXNrc0NvbnRyb2xsZXInXG5cbiAgZ2V0U3VidGFza3MgPSAtPlxuICAgIEpvYnNTZXJ2aWNlLmdldFN1YnRhc2tzKCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBkYXRhXG5cbiAgaWYgJHNjb3BlLm5vZGVpZCBhbmQgKCEkc2NvcGUudmVydGV4IG9yICEkc2NvcGUudmVydGV4LnN0KVxuICAgIGdldFN1YnRhc2tzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlBsYW5TdWJ0YXNrc0NvbnRyb2xsZXInXG4gICAgZ2V0U3VidGFza3MoKSBpZiAkc2NvcGUubm9kZWlkXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5UYXNrTWFuYWdlcnNDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UpIC0+XG4gIGNvbnNvbGUubG9nICdKb2JQbGFuVGFza01hbmFnZXJzQ29udHJvbGxlcidcblxuICBnZXRUYXNrTWFuYWdlcnMgPSAtPlxuICAgIEpvYnNTZXJ2aWNlLmdldFRhc2tNYW5hZ2Vycygkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLnRhc2ttYW5hZ2VycyA9IGRhdGFcblxuICBpZiAkc2NvcGUubm9kZWlkIGFuZCAoISRzY29wZS52ZXJ0ZXggb3IgISRzY29wZS52ZXJ0ZXguc3QpXG4gICAgZ2V0VGFza01hbmFnZXJzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlBsYW5UYXNrTWFuYWdlcnNDb250cm9sbGVyJ1xuICAgIGdldFRhc2tNYW5hZ2VycygpIGlmICRzY29wZS5ub2RlaWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSkgLT5cbiAgY29uc29sZS5sb2cgJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJ1xuXG4gIGdldEFjY3VtdWxhdG9ycyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0QWNjdW11bGF0b3JzKCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gZGF0YS5tYWluXG4gICAgICAkc2NvcGUuc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3NcblxuICBpZiAkc2NvcGUubm9kZWlkIGFuZCAoISRzY29wZS52ZXJ0ZXggb3IgISRzY29wZS52ZXJ0ZXguYWNjdW11bGF0b3JzKVxuICAgIGdldEFjY3VtdWxhdG9ycygpXG5cbiAgJHNjb3BlLiRvbiAncmVsb2FkJywgKGV2ZW50KSAtPlxuICAgIGNvbnNvbGUubG9nICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcidcbiAgICBnZXRBY2N1bXVsYXRvcnMoKSBpZiAkc2NvcGUubm9kZWlkXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSkgLT5cbiAgY29uc29sZS5sb2cgJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInXG5cbiAgZ2V0Sm9iQ2hlY2twb2ludFN0YXRzID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRKb2JDaGVja3BvaW50U3RhdHMoJHNjb3BlLmpvYmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmpvYkNoZWNrcG9pbnRTdGF0cyA9IGRhdGFcblxuICBnZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IGRhdGEub3BlcmF0b3JTdGF0c1xuICAgICAgJHNjb3BlLnN1YnRhc2tzQ2hlY2twb2ludFN0YXRzID0gZGF0YS5zdWJ0YXNrc1N0YXRzXG5cbiAgIyBHZXQgdGhlIHBlciBqb2Igc3RhdHNcbiAgZ2V0Sm9iQ2hlY2twb2ludFN0YXRzKClcblxuICAjIEdldCB0aGUgcGVyIG9wZXJhdG9yIHN0YXRzXG4gIGlmICRzY29wZS5ub2RlaWQgYW5kICghJHNjb3BlLnZlcnRleCBvciAhJHNjb3BlLnZlcnRleC5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cylcbiAgICBnZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cygpXG5cbiAgJHNjb3BlLiRvbiAncmVsb2FkJywgKGV2ZW50KSAtPlxuICAgIGNvbnNvbGUubG9nICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gICAgZ2V0Sm9iQ2hlY2twb2ludFN0YXRzKClcbiAgICBnZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cygpIGlmICRzY29wZS5ub2RlaWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSkgLT5cbiAgY29uc29sZS5sb2cgJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJ1xuXG4gIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gLT5cbiAgICAkc2NvcGUubm93ID0gRGF0ZS5ub3coKVxuXG4gICAgaWYgJHNjb3BlLm5vZGVpZFxuICAgICAgSm9ic1NlcnZpY2UuZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzWyRzY29wZS5ub2RlaWRdID0gZGF0YVxuXG4gIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyIChyZWxvYWQpJ1xuICAgIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJ1xuXG4gIGdldFZlcnRleCA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzdGF0ZVBhcmFtcy52ZXJ0ZXhJZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS52ZXJ0ZXggPSBkYXRhXG5cbiAgZ2V0VmVydGV4KClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlRpbWVsaW5lVmVydGV4Q29udHJvbGxlcidcbiAgICBnZXRWZXJ0ZXgoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgSm9ic1NlcnZpY2UubG9hZEV4Y2VwdGlvbnMoKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5leGNlcHRpb25zID0gZGF0YVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQcm9wZXJ0aWVzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iUHJvcGVydGllc0NvbnRyb2xsZXInXG5cbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSAobm9kZWlkKSAtPlxuICAgIGlmIG5vZGVpZCAhPSAkc2NvcGUubm9kZWlkXG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkXG5cbiAgICAgIEpvYnNTZXJ2aWNlLmdldE5vZGUobm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgICAkc2NvcGUubm9kZSA9IGRhdGFcblxuICAgIGVsc2VcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgICAkc2NvcGUubm9kZSA9IG51bGxcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UsIE1ldHJpY3NTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJ1xuXG4gIHNpbmUgPSAtPlxuICAgIHNpbiA9IFtdXG4gICAgbm93ID0gK25ldyBEYXRlXG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgMTAwXG4gICAgICBzaW4ucHVzaFxuICAgICAgICB4OiBub3cgKyBpICogMTAwMCAqIDYwICogNjAgKiAyNFxuICAgICAgICB5OiBNYXRoLnNpbihpIC8gMTApXG4gICAgICBpKytcbiAgICBzaW5cblxuICBsb2FkTWV0cmljcyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUudmVydGV4ID0gZGF0YVxuXG4gICAgTWV0cmljc1NlcnZpY2UuZ2V0QXZhaWxhYmxlTWV0cmljcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuYXZhaWxhYmxlTWV0cmljcyA9IGRhdGFcbiMgICAgICBjb25zb2xlLmxvZyBkYXRhXG4jICAgICAgaWRzID0gW11cbiMgICAgICBhbmd1bGFyLmZvckVhY2ggZGF0YSwgKHYsIGspIC0+XG4jICAgICAgICBpZHMucHVzaCh2LmlkKVxuXG4gICAgICBzZXR1cCA9IE1ldHJpY3NTZXJ2aWNlLmdldE1ldHJpY3NTZXR1cCgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpXG4gICAgICAkc2NvcGUubWV0cmljcyA9IHNldHVwLmxpc3RcblxuICAgICAgTWV0cmljc1NlcnZpY2UuZ2V0TWV0cmljcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIHNldHVwLmxpc3QpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0IFwibWV0cmljczpkYXRhOnVwZGF0ZVwiLCBkYXRhXG5cbiAgJHNjb3BlLm9wdGlvbnMgPSBjaGFydDpcbiAgICB0eXBlOiAnc3BhcmtsaW5lUGx1cydcbiAgICBoZWlnaHQ6IDE1MFxuICAgIHg6IChkLCBpKSAtPlxuICAgICAgaVxuICAgIHhUaWNrRm9ybWF0OiAoZCkgLT5cbiAgICAgIGQzLnRpbWUuZm9ybWF0KCcleCcpIG5ldyBEYXRlKCRzY29wZS5kYXRhW2RdLngpXG4gICAgZHVyYXRpb246IDI1MFxuXG4gICRzY29wZS5kYXRhID0gc2luZSgpO1xuXG4gICRzY29wZS5hZGRNZXRyaWMgPSAobWV0cmljKSAtPlxuICAgIGNvbnNvbGUubG9nIG1ldHJpY1xuICAgIE1ldHJpY3NTZXJ2aWNlLmFkZE1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYy5pZClcbiAgICBsb2FkTWV0cmljcygpXG5cbiAgJHNjb3BlLnJlbW92ZU1ldHJpYyA9IChtZXRyaWNJZCkgLT5cbiAgICBjb25zb2xlLmxvZyBtZXRyaWNJZFxuICAgIE1ldHJpY3NTZXJ2aWNlLnJlbW92ZU1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpY0lkKVxuICAgIGxvYWRNZXRyaWNzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlBsYW5NZXRyaWNzQ29udHJvbGxlcidcbiAgICBsb2FkTWV0cmljcygpIGlmICRzY29wZS5ub2RlaWRcblxuICBsb2FkTWV0cmljcygpIGlmICRzY29wZS5ub2RlaWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignUnVubmluZ0pvYnNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIHtcbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5qb2JzID0gSm9ic1NlcnZpY2UuZ2V0Sm9icygncnVubmluZycpO1xuICB9O1xuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICB9KTtcbiAgcmV0dXJuICRzY29wZS5qb2JPYnNlcnZlcigpO1xufSkuY29udHJvbGxlcignQ29tcGxldGVkSm9ic0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLmpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpO1xuICB9O1xuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICB9KTtcbiAgcmV0dXJuICRzY29wZS5qb2JPYnNlcnZlcigpO1xufSkuY29udHJvbGxlcignU2luZ2xlSm9iQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlLCAkcm9vdFNjb3BlLCBmbGlua0NvbmZpZywgJGludGVydmFsKSB7XG4gIHZhciByZWZyZXNoZXI7XG4gIGNvbnNvbGUubG9nKCdTaW5nbGVKb2JDb250cm9sbGVyJyk7XG4gICRzY29wZS5qb2JpZCA9ICRzdGF0ZVBhcmFtcy5qb2JpZDtcbiAgJHNjb3BlLmpvYiA9IG51bGw7XG4gICRzY29wZS5wbGFuID0gbnVsbDtcbiAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbDtcbiAgJHNjb3BlLmpvYkNoZWNrcG9pbnRTdGF0cyA9IG51bGw7XG4gICRzY29wZS5zaG93SGlzdG9yeSA9IGZhbHNlO1xuICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IHt9O1xuICBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgJHNjb3BlLmpvYiA9IGRhdGE7XG4gICAgJHNjb3BlLnBsYW4gPSBkYXRhLnBsYW47XG4gICAgcmV0dXJuICRzY29wZS52ZXJ0aWNlcyA9IGRhdGEudmVydGljZXM7XG4gIH0pO1xuICByZWZyZXNoZXIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmxvYWRKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5qb2IgPSBkYXRhO1xuICAgICAgcmV0dXJuICRzY29wZS4kYnJvYWRjYXN0KCdyZWxvYWQnKTtcbiAgICB9KTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuam9iID0gbnVsbDtcbiAgICAkc2NvcGUucGxhbiA9IG51bGw7XG4gICAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbDtcbiAgICAkc2NvcGUuam9iQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IG51bGw7XG4gICAgcmV0dXJuICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaGVyKTtcbiAgfSk7XG4gICRzY29wZS5jYW5jZWxKb2IgPSBmdW5jdGlvbihjYW5jZWxFdmVudCkge1xuICAgIGFuZ3VsYXIuZWxlbWVudChjYW5jZWxFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ0NhbmNlbGxpbmcuLi4nKTtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuY2FuY2VsSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS5zdG9wSm9iID0gZnVuY3Rpb24oc3RvcEV2ZW50KSB7XG4gICAgYW5ndWxhci5lbGVtZW50KHN0b3BFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ1N0b3BwaW5nLi4uJyk7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnN0b3BKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS50b2dnbGVIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5zaG93SGlzdG9yeSA9ICEkc2NvcGUuc2hvd0hpc3Rvcnk7XG4gIH07XG59KS5jb250cm9sbGVyKCdKb2JQbGFuQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuQ29udHJvbGxlcicpO1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAkc2NvcGUuc3RhdGVMaXN0ID0gSm9ic1NlcnZpY2Uuc3RhdGVMaXN0KCk7XG4gICRzY29wZS5jaGFuZ2VOb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgaWYgKG5vZGVpZCAhPT0gJHNjb3BlLm5vZGVpZCkge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZDtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsO1xuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdCgncmVsb2FkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsO1xuICAgICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGw7XG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsO1xuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgICByZXR1cm4gJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICB9XG4gIH07XG4gICRzY29wZS5kZWFjdGl2YXRlTm9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5ub2RlaWQgPSBudWxsO1xuICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZTtcbiAgICAkc2NvcGUudmVydGV4ID0gbnVsbDtcbiAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsO1xuICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsO1xuICAgIHJldHVybiAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsO1xuICB9O1xuICByZXR1cm4gJHNjb3BlLnRvZ2dsZUZvbGQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLm5vZGVVbmZvbGRlZCA9ICEkc2NvcGUubm9kZVVuZm9sZGVkO1xuICB9O1xufSkuY29udHJvbGxlcignSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9ic1NlcnZpY2UpIHtcbiAgdmFyIGdldFN1YnRhc2tzO1xuICBjb25zb2xlLmxvZygnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcicpO1xuICBnZXRTdWJ0YXNrcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRTdWJ0YXNrcygkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuc3VidGFza3MgPSBkYXRhO1xuICAgIH0pO1xuICB9O1xuICBpZiAoJHNjb3BlLm5vZGVpZCAmJiAoISRzY29wZS52ZXJ0ZXggfHwgISRzY29wZS52ZXJ0ZXguc3QpKSB7XG4gICAgZ2V0U3VidGFza3MoKTtcbiAgfVxuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcicpO1xuICAgIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgICByZXR1cm4gZ2V0U3VidGFza3MoKTtcbiAgICB9XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRUYXNrTWFuYWdlcnM7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuVGFza01hbmFnZXJzQ29udHJvbGxlcicpO1xuICBnZXRUYXNrTWFuYWdlcnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0VGFza01hbmFnZXJzKCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS50YXNrbWFuYWdlcnMgPSBkYXRhO1xuICAgIH0pO1xuICB9O1xuICBpZiAoJHNjb3BlLm5vZGVpZCAmJiAoISRzY29wZS52ZXJ0ZXggfHwgISRzY29wZS52ZXJ0ZXguc3QpKSB7XG4gICAgZ2V0VGFza01hbmFnZXJzKCk7XG4gIH1cbiAgcmV0dXJuICRzY29wZS4kb24oJ3JlbG9hZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ0pvYlBsYW5UYXNrTWFuYWdlcnNDb250cm9sbGVyJyk7XG4gICAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICAgIHJldHVybiBnZXRUYXNrTWFuYWdlcnMoKTtcbiAgICB9XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRBY2N1bXVsYXRvcnM7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcicpO1xuICBnZXRBY2N1bXVsYXRvcnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0QWNjdW11bGF0b3JzKCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IGRhdGEubWFpbjtcbiAgICAgIHJldHVybiAkc2NvcGUuc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3M7XG4gICAgfSk7XG4gIH07XG4gIGlmICgkc2NvcGUubm9kZWlkICYmICghJHNjb3BlLnZlcnRleCB8fCAhJHNjb3BlLnZlcnRleC5hY2N1bXVsYXRvcnMpKSB7XG4gICAgZ2V0QWNjdW11bGF0b3JzKCk7XG4gIH1cbiAgcmV0dXJuICRzY29wZS4kb24oJ3JlbG9hZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJyk7XG4gICAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICAgIHJldHVybiBnZXRBY2N1bXVsYXRvcnMoKTtcbiAgICB9XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9ic1NlcnZpY2UpIHtcbiAgdmFyIGdldEpvYkNoZWNrcG9pbnRTdGF0cywgZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHM7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJyk7XG4gIGdldEpvYkNoZWNrcG9pbnRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRKb2JDaGVja3BvaW50U3RhdHMoJHNjb3BlLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuam9iQ2hlY2twb2ludFN0YXRzID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbiAgZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMoJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBkYXRhLm9wZXJhdG9yU3RhdHM7XG4gICAgICByZXR1cm4gJHNjb3BlLnN1YnRhc2tzQ2hlY2twb2ludFN0YXRzID0gZGF0YS5zdWJ0YXNrc1N0YXRzO1xuICAgIH0pO1xuICB9O1xuICBnZXRKb2JDaGVja3BvaW50U3RhdHMoKTtcbiAgaWYgKCRzY29wZS5ub2RlaWQgJiYgKCEkc2NvcGUudmVydGV4IHx8ICEkc2NvcGUudmVydGV4Lm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzKSkge1xuICAgIGdldE9wZXJhdG9yQ2hlY2twb2ludFN0YXRzKCk7XG4gIH1cbiAgcmV0dXJuICRzY29wZS4kb24oJ3JlbG9hZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInKTtcbiAgICBnZXRKb2JDaGVja3BvaW50U3RhdHMoKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldE9wZXJhdG9yQ2hlY2twb2ludFN0YXRzKCk7XG4gICAgfVxuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmU7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuQmFja1ByZXNzdXJlQ29udHJvbGxlcicpO1xuICBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5ub3cgPSBEYXRlLm5vdygpO1xuICAgIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgICBKb2JzU2VydmljZS5nZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHt9KTtcbiAgICAgIHJldHVybiAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0c1skc2NvcGUubm9kZWlkXSA9IGRhdGE7XG4gICAgfVxuICB9O1xuICBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgpO1xuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXIgKHJlbG9hZCknKTtcbiAgICByZXR1cm4gZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKTtcbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0VmVydGV4O1xuICBjb25zb2xlLmxvZygnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJyk7XG4gIGdldFZlcnRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRWZXJ0ZXgoJHN0YXRlUGFyYW1zLnZlcnRleElkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUudmVydGV4ID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbiAgZ2V0VmVydGV4KCk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInKTtcbiAgICByZXR1cm4gZ2V0VmVydGV4KCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICByZXR1cm4gSm9ic1NlcnZpY2UubG9hZEV4Y2VwdGlvbnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLmV4Y2VwdGlvbnMgPSBkYXRhO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYlByb3BlcnRpZXNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICBjb25zb2xlLmxvZygnSm9iUHJvcGVydGllc0NvbnRyb2xsZXInKTtcbiAgcmV0dXJuICRzY29wZS5jaGFuZ2VOb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgaWYgKG5vZGVpZCAhPT0gJHNjb3BlLm5vZGVpZCkge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZDtcbiAgICAgIHJldHVybiBKb2JzU2VydmljZS5nZXROb2RlKG5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUubm9kZSA9IGRhdGE7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgICByZXR1cm4gJHNjb3BlLm5vZGUgPSBudWxsO1xuICAgIH1cbiAgfTtcbn0pLmNvbnRyb2xsZXIoJ0pvYlBsYW5NZXRyaWNzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9ic1NlcnZpY2UsIE1ldHJpY3NTZXJ2aWNlKSB7XG4gIHZhciBsb2FkTWV0cmljcywgc2luZTtcbiAgY29uc29sZS5sb2coJ0pvYlBsYW5NZXRyaWNzQ29udHJvbGxlcicpO1xuICBzaW5lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIG5vdywgc2luO1xuICAgIHNpbiA9IFtdO1xuICAgIG5vdyA9ICsobmV3IERhdGUpO1xuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgMTAwKSB7XG4gICAgICBzaW4ucHVzaCh7XG4gICAgICAgIHg6IG5vdyArIGkgKiAxMDAwICogNjAgKiA2MCAqIDI0LFxuICAgICAgICB5OiBNYXRoLnNpbihpIC8gMTApXG4gICAgICB9KTtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHNpbjtcbiAgfTtcbiAgbG9hZE1ldHJpY3MgPSBmdW5jdGlvbigpIHtcbiAgICBKb2JzU2VydmljZS5nZXRWZXJ0ZXgoJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLnZlcnRleCA9IGRhdGE7XG4gICAgfSk7XG4gICAgcmV0dXJuIE1ldHJpY3NTZXJ2aWNlLmdldEF2YWlsYWJsZU1ldHJpY3MoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBzZXR1cDtcbiAgICAgICRzY29wZS5hdmFpbGFibGVNZXRyaWNzID0gZGF0YTtcbiAgICAgIHNldHVwID0gTWV0cmljc1NlcnZpY2UuZ2V0TWV0cmljc1NldHVwKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCk7XG4gICAgICAkc2NvcGUubWV0cmljcyA9IHNldHVwLmxpc3Q7XG4gICAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0TWV0cmljcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIHNldHVwLmxpc3QpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLiRicm9hZGNhc3QoXCJtZXRyaWNzOmRhdGE6dXBkYXRlXCIsIGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS5vcHRpb25zID0ge1xuICAgIGNoYXJ0OiB7XG4gICAgICB0eXBlOiAnc3BhcmtsaW5lUGx1cycsXG4gICAgICBoZWlnaHQ6IDE1MCxcbiAgICAgIHg6IGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9LFxuICAgICAgeFRpY2tGb3JtYXQ6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQzLnRpbWUuZm9ybWF0KCcleCcpKG5ldyBEYXRlKCRzY29wZS5kYXRhW2RdLngpKTtcbiAgICAgIH0sXG4gICAgICBkdXJhdGlvbjogMjUwXG4gICAgfVxuICB9O1xuICAkc2NvcGUuZGF0YSA9IHNpbmUoKTtcbiAgJHNjb3BlLmFkZE1ldHJpYyA9IGZ1bmN0aW9uKG1ldHJpYykge1xuICAgIGNvbnNvbGUubG9nKG1ldHJpYyk7XG4gICAgTWV0cmljc1NlcnZpY2UuYWRkTWV0cmljKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljLmlkKTtcbiAgICByZXR1cm4gbG9hZE1ldHJpY3MoKTtcbiAgfTtcbiAgJHNjb3BlLnJlbW92ZU1ldHJpYyA9IGZ1bmN0aW9uKG1ldHJpY0lkKSB7XG4gICAgY29uc29sZS5sb2cobWV0cmljSWQpO1xuICAgIE1ldHJpY3NTZXJ2aWNlLnJlbW92ZU1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpY0lkKTtcbiAgICByZXR1cm4gbG9hZE1ldHJpY3MoKTtcbiAgfTtcbiAgJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJyk7XG4gICAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICAgIHJldHVybiBsb2FkTWV0cmljcygpO1xuICAgIH1cbiAgfSk7XG4gIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH1cbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICd2ZXJ0ZXgnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZSBzZWNvbmRhcnknIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiXG5cbiAgc2NvcGU6XG4gICAgZGF0YTogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICBhbmFseXplVGltZSA9IChkYXRhKSAtPlxuICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpXG5cbiAgICAgIHRlc3REYXRhID0gW11cblxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEuc3VidGFza3MsIChzdWJ0YXNrLCBpKSAtPlxuICAgICAgICB0aW1lcyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJTY2hlZHVsZWRcIlxuICAgICAgICAgICAgY29sb3I6IFwiIzY2NlwiXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCJcbiAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlNDSEVEVUxFRFwiXVxuICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIkRlcGxveWluZ1wiXG4gICAgICAgICAgICBjb2xvcjogXCIjYWFhXCJcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIlxuICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICBdXG5cbiAgICAgICAgaWYgc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0gPiAwXG4gICAgICAgICAgdGltZXMucHVzaCB7XG4gICAgICAgICAgICBsYWJlbDogXCJSdW5uaW5nXCJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNkZGRcIlxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiXG4gICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJSVU5OSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl1cbiAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgIH1cblxuICAgICAgICB0ZXN0RGF0YS5wdXNoIHtcbiAgICAgICAgICBsYWJlbDogXCIoI3tzdWJ0YXNrLnN1YnRhc2t9KSAje3N1YnRhc2suaG9zdH1cIlxuICAgICAgICAgIHRpbWVzOiB0aW1lc1xuICAgICAgICB9XG5cbiAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpXG4gICAgICAudGlja0Zvcm1hdCh7XG4gICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKVxuICAgICAgICAjIHRpY2tJbnRlcnZhbDogMVxuICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgfSlcbiAgICAgIC5wcmVmaXgoXCJzaW5nbGVcIilcbiAgICAgIC5sYWJlbEZvcm1hdCgobGFiZWwpIC0+XG4gICAgICAgIGxhYmVsXG4gICAgICApXG4gICAgICAubWFyZ2luKHsgbGVmdDogMTAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDAgfSlcbiAgICAgIC5pdGVtSGVpZ2h0KDMwKVxuICAgICAgLnJlbGF0aXZlVGltZSgpXG5cbiAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmdFbClcbiAgICAgIC5kYXR1bSh0ZXN0RGF0YSlcbiAgICAgIC5jYWxsKGNoYXJ0KVxuXG4gICAgYW5hbHl6ZVRpbWUoc2NvcGUuZGF0YSlcblxuICAgIHJldHVyblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAndGltZWxpbmUnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCJcblxuICBzY29wZTpcbiAgICB2ZXJ0aWNlczogXCI9XCJcbiAgICBqb2JpZDogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICB0cmFuc2xhdGVMYWJlbCA9IChsYWJlbCkgLT5cbiAgICAgIGxhYmVsLnJlcGxhY2UoXCImZ3Q7XCIsIFwiPlwiKVxuXG4gICAgYW5hbHl6ZVRpbWUgPSAoZGF0YSkgLT5cbiAgICAgIGQzLnNlbGVjdChzdmdFbCkuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKVxuXG4gICAgICB0ZXN0RGF0YSA9IFtdXG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLCAodmVydGV4KSAtPlxuICAgICAgICBpZiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSA+IC0xXG4gICAgICAgICAgaWYgdmVydGV4LnR5cGUgaXMgJ3NjaGVkdWxlZCdcbiAgICAgICAgICAgIHRlc3REYXRhLnB1c2ggXG4gICAgICAgICAgICAgIHRpbWVzOiBbXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZUxhYmVsKHZlcnRleC5uYW1lKVxuICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNjY2NjY2NcIlxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTU1NTVcIlxuICAgICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHZlcnRleFsnc3RhcnQtdGltZSddXG4gICAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHZlcnRleFsnZW5kLXRpbWUnXVxuICAgICAgICAgICAgICAgIHR5cGU6IHZlcnRleC50eXBlXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZXN0RGF0YS5wdXNoIFxuICAgICAgICAgICAgICB0aW1lczogW1xuICAgICAgICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVMYWJlbCh2ZXJ0ZXgubmFtZSlcbiAgICAgICAgICAgICAgICBjb2xvcjogXCIjZDlmMWY3XCJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNjJjZGVhXCJcbiAgICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXVxuICAgICAgICAgICAgICAgIGVuZGluZ190aW1lOiB2ZXJ0ZXhbJ2VuZC10aW1lJ11cbiAgICAgICAgICAgICAgICBsaW5rOiB2ZXJ0ZXguaWRcbiAgICAgICAgICAgICAgICB0eXBlOiB2ZXJ0ZXgudHlwZVxuICAgICAgICAgICAgICBdXG5cbiAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpLmNsaWNrKChkLCBpLCBkYXR1bSkgLT5cbiAgICAgICAgaWYgZC5saW5rXG4gICAgICAgICAgJHN0YXRlLmdvIFwic2luZ2xlLWpvYi50aW1lbGluZS52ZXJ0ZXhcIiwgeyBqb2JpZDogc2NvcGUuam9iaWQsIHZlcnRleElkOiBkLmxpbmsgfVxuXG4gICAgICApXG4gICAgICAudGlja0Zvcm1hdCh7XG4gICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKVxuICAgICAgICAjIHRpY2tUaW1lOiBkMy50aW1lLnNlY29uZFxuICAgICAgICAjIHRpY2tJbnRlcnZhbDogMC41XG4gICAgICAgIHRpY2tTaXplOiAxXG4gICAgICB9KVxuICAgICAgLnByZWZpeChcIm1haW5cIilcbiAgICAgIC5tYXJnaW4oeyBsZWZ0OiAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDAgfSlcbiAgICAgIC5pdGVtSGVpZ2h0KDMwKVxuICAgICAgLnNob3dCb3JkZXJMaW5lKClcbiAgICAgIC5zaG93SG91clRpbWVsaW5lKClcblxuICAgICAgc3ZnID0gZDMuc2VsZWN0KHN2Z0VsKVxuICAgICAgLmRhdHVtKHRlc3REYXRhKVxuICAgICAgLmNhbGwoY2hhcnQpXG5cbiAgICBzY29wZS4kd2F0Y2ggYXR0cnMudmVydGljZXMsIChkYXRhKSAtPlxuICAgICAgYW5hbHl6ZVRpbWUoZGF0YSkgaWYgZGF0YVxuXG4gICAgcmV0dXJuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdqb2JQbGFuJywgKCR0aW1lb3V0KSAtPlxuICB0ZW1wbGF0ZTogXCJcbiAgICA8c3ZnIGNsYXNzPSdncmFwaCcgd2lkdGg9JzUwMCcgaGVpZ2h0PSc0MDAnPjxnIC8+PC9zdmc+XG4gICAgPHN2ZyBjbGFzcz0ndG1wJyB3aWR0aD0nMScgaGVpZ2h0PScxJz48ZyAvPjwvc3ZnPlxuICAgIDxkaXYgY2xhc3M9J2J0bi1ncm91cCB6b29tLWJ1dHRvbnMnPlxuICAgICAgPGEgY2xhc3M9J2J0biBidG4tZGVmYXVsdCB6b29tLWluJyBuZy1jbGljaz0nem9vbUluKCknPjxpIGNsYXNzPSdmYSBmYS1wbHVzJyAvPjwvYT5cbiAgICAgIDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQgem9vbS1vdXQnIG5nLWNsaWNrPSd6b29tT3V0KCknPjxpIGNsYXNzPSdmYSBmYS1taW51cycgLz48L2E+XG4gICAgPC9kaXY+XCJcblxuICBzY29wZTpcbiAgICBwbGFuOiAnPSdcbiAgICBzZXROb2RlOiAnJidcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIGcgPSBudWxsXG4gICAgbWFpblpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICBzdWJncmFwaHMgPSBbXVxuICAgIGpvYmlkID0gYXR0cnMuam9iaWRcblxuICAgIG1haW5TdmdFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzBdXG4gICAgbWFpbkcgPSBlbGVtLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVswXVxuICAgIG1haW5UbXBFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzFdXG5cbiAgICBkM21haW5TdmcgPSBkMy5zZWxlY3QobWFpblN2Z0VsZW1lbnQpXG4gICAgZDNtYWluU3ZnRyA9IGQzLnNlbGVjdChtYWluRylcbiAgICBkM3RtcFN2ZyA9IGQzLnNlbGVjdChtYWluVG1wRWxlbWVudClcblxuICAgICMgYW5ndWxhci5lbGVtZW50KG1haW5HKS5lbXB0eSgpXG4gICAgIyBkM21haW5TdmdHLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKClcblxuICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKClcbiAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbS5jaGlsZHJlbigpWzBdKS53aWR0aChjb250YWluZXJXKVxuXG4gICAgc2NvcGUuem9vbUluID0gLT5cbiAgICAgIGlmIG1haW5ab29tLnNjYWxlKCkgPCAyLjk5XG4gICAgICAgIFxuICAgICAgICAjIENhbGN1bGF0ZSBhbmQgc3RvcmUgbmV3IHZhbHVlcyBpbiB6b29tIG9iamVjdFxuICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpICsgMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpICsgMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICBtYWluWm9vbS5zY2FsZSBtYWluWm9vbS5zY2FsZSgpICsgMC4xXG4gICAgICAgIG1haW5ab29tLnRyYW5zbGF0ZSBbIHYxLCB2MiBdXG4gICAgICAgIFxuICAgICAgICAjIFRyYW5zZm9ybSBzdmdcbiAgICAgICAgZDNtYWluU3ZnRy5hdHRyIFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiXG5cbiAgICBzY29wZS56b29tT3V0ID0gLT5cbiAgICAgIGlmIG1haW5ab29tLnNjYWxlKCkgPiAwLjMxXG4gICAgICAgIFxuICAgICAgICAjIENhbGN1bGF0ZSBhbmQgc3RvcmUgbmV3IHZhbHVlcyBpbiBtYWluWm9vbSBvYmplY3RcbiAgICAgICAgbWFpblpvb20uc2NhbGUgbWFpblpvb20uc2NhbGUoKSAtIDAuMVxuICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUgWyB2MSwgdjIgXVxuICAgICAgICBcbiAgICAgICAgIyBUcmFuc2Zvcm0gc3ZnXG4gICAgICAgIGQzbWFpblN2Z0cuYXR0ciBcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHYxICsgXCIsXCIgKyB2MiArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIlxuXG4gICAgI2NyZWF0ZSBhIGxhYmVsIG9mIGFuIGVkZ2VcbiAgICBjcmVhdGVMYWJlbEVkZ2UgPSAoZWwpIC0+XG4gICAgICBsYWJlbFZhbHVlID0gXCJcIlxuICAgICAgaWYgZWwuc2hpcF9zdHJhdGVneT8gb3IgZWwubG9jYWxfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8ZGl2IGNsYXNzPSdlZGdlLWxhYmVsJz5cIlxuICAgICAgICBsYWJlbFZhbHVlICs9IGVsLnNoaXBfc3RyYXRlZ3kgIGlmIGVsLnNoaXBfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCIgKFwiICsgZWwudGVtcF9tb2RlICsgXCIpXCIgIHVubGVzcyBlbC50ZW1wX21vZGUgaXMgYHVuZGVmaW5lZGBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneSAgdW5sZXNzIGVsLmxvY2FsX3N0cmF0ZWd5IGlzIGB1bmRlZmluZWRgXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8L2Rpdj5cIlxuICAgICAgbGFiZWxWYWx1ZVxuXG5cbiAgICAjIHRydWUsIGlmIHRoZSBub2RlIGlzIGEgc3BlY2lhbCBub2RlIGZyb20gYW4gaXRlcmF0aW9uXG4gICAgaXNTcGVjaWFsSXRlcmF0aW9uTm9kZSA9IChpbmZvKSAtPlxuICAgICAgKGluZm8gaXMgXCJwYXJ0aWFsU29sdXRpb25cIiBvciBpbmZvIGlzIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIG9yIGluZm8gaXMgXCJ3b3Jrc2V0XCIgb3IgaW5mbyBpcyBcIm5leHRXb3Jrc2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uU2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uRGVsdGFcIilcblxuICAgIGdldE5vZGVUeXBlID0gKGVsLCBpbmZvKSAtPlxuICAgICAgaWYgaW5mbyBpcyBcIm1pcnJvclwiXG4gICAgICAgICdub2RlLW1pcnJvcidcblxuICAgICAgZWxzZSBpZiBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pXG4gICAgICAgICdub2RlLWl0ZXJhdGlvbidcblxuICAgICAgZWxzZVxuICAgICAgICAgICdub2RlLW5vcm1hbCdcbiAgICAgIFxuICAgICMgY3JlYXRlcyB0aGUgbGFiZWwgb2YgYSBub2RlLCBpbiBpbmZvIGlzIHN0b3JlZCwgd2hldGhlciBpdCBpcyBhIHNwZWNpYWwgbm9kZSAobGlrZSBhIG1pcnJvciBpbiBhbiBpdGVyYXRpb24pXG4gICAgY3JlYXRlTGFiZWxOb2RlID0gKGVsLCBpbmZvLCBtYXhXLCBtYXhIKSAtPlxuICAgICAgIyBsYWJlbFZhbHVlID0gXCI8YSBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiXG4gICAgICBsYWJlbFZhbHVlID0gXCI8ZGl2IGhyZWY9JyMvam9icy9cIiArIGpvYmlkICsgXCIvdmVydGV4L1wiICsgZWwuaWQgKyBcIicgY2xhc3M9J25vZGUtbGFiZWwgXCIgKyBnZXROb2RlVHlwZShlbCwgaW5mbykgKyBcIic+XCJcblxuICAgICAgIyBOb2RlbmFtZVxuICAgICAgaWYgaW5mbyBpcyBcIm1pcnJvclwiXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+TWlycm9yIG9mIFwiICsgZWwub3BlcmF0b3IgKyBcIjwvaDM+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoMyBjbGFzcz0nbm9kZS1uYW1lJz5cIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiXG4gICAgICBpZiBlbC5kZXNjcmlwdGlvbiBpcyBcIlwiXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCJcIlxuICAgICAgZWxzZVxuICAgICAgICBzdGVwTmFtZSA9IGVsLmRlc2NyaXB0aW9uXG4gICAgICAgIFxuICAgICAgICAjIGNsZWFuIHN0ZXBOYW1lXG4gICAgICAgIHN0ZXBOYW1lID0gc2hvcnRlblN0cmluZyhzdGVwTmFtZSlcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNCBjbGFzcz0nc3RlcC1uYW1lJz5cIiArIHN0ZXBOYW1lICsgXCI8L2g0PlwiXG4gICAgICBcbiAgICAgICMgSWYgdGhpcyBub2RlIGlzIGFuIFwiaXRlcmF0aW9uXCIgd2UgbmVlZCBhIGRpZmZlcmVudCBwYW5lbC1ib2R5XG4gICAgICBpZiBlbC5zdGVwX2Z1bmN0aW9uP1xuICAgICAgICBsYWJlbFZhbHVlICs9IGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbihlbC5pZCwgbWF4VywgbWF4SClcbiAgICAgIGVsc2VcbiAgICAgICAgXG4gICAgICAgICMgT3RoZXJ3aXNlIGFkZCBpbmZvcyAgICBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5cIiArIGluZm8gKyBcIiBOb2RlPC9oNT5cIiAgaWYgaXNTcGVjaWFsSXRlcmF0aW9uTm9kZShpbmZvKVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1PlBhcmFsbGVsaXNtOiBcIiArIGVsLnBhcmFsbGVsaXNtICsgXCI8L2g1PlwiICB1bmxlc3MgZWwucGFyYWxsZWxpc20gaXMgXCJcIlxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1Pk9wZXJhdGlvbjogXCIgKyBzaG9ydGVuU3RyaW5nKGVsLm9wZXJhdG9yX3N0cmF0ZWd5KSArIFwiPC9oNT5cIiAgdW5sZXNzIGVsLm9wZXJhdG9yIGlzIGB1bmRlZmluZWRgXG4gICAgICBcbiAgICAgICMgbGFiZWxWYWx1ZSArPSBcIjwvYT5cIlxuICAgICAgbGFiZWxWYWx1ZSArPSBcIjwvZGl2PlwiXG4gICAgICBsYWJlbFZhbHVlXG5cbiAgICAjIEV4dGVuZHMgdGhlIGxhYmVsIG9mIGEgbm9kZSB3aXRoIGFuIGFkZGl0aW9uYWwgc3ZnIEVsZW1lbnQgdG8gcHJlc2VudCB0aGUgaXRlcmF0aW9uLlxuICAgIGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbiA9IChpZCwgbWF4VywgbWF4SCkgLT5cbiAgICAgIHN2Z0lEID0gXCJzdmctXCIgKyBpZFxuXG4gICAgICBsYWJlbFZhbHVlID0gXCI8c3ZnIGNsYXNzPSdcIiArIHN2Z0lEICsgXCInIHdpZHRoPVwiICsgbWF4VyArIFwiIGhlaWdodD1cIiArIG1heEggKyBcIj48ZyAvPjwvc3ZnPlwiXG4gICAgICBsYWJlbFZhbHVlXG5cbiAgICAjIFNwbGl0IGEgc3RyaW5nIGludG8gbXVsdGlwbGUgbGluZXMgc28gdGhhdCBlYWNoIGxpbmUgaGFzIGxlc3MgdGhhbiAzMCBsZXR0ZXJzLlxuICAgIHNob3J0ZW5TdHJpbmcgPSAocykgLT5cbiAgICAgICMgbWFrZSBzdXJlIHRoYXQgbmFtZSBkb2VzIG5vdCBjb250YWluIGEgPCAoYmVjYXVzZSBvZiBodG1sKVxuICAgICAgaWYgcy5jaGFyQXQoMCkgaXMgXCI8XCJcbiAgICAgICAgcyA9IHMucmVwbGFjZShcIjxcIiwgXCImbHQ7XCIpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoXCI+XCIsIFwiJmd0O1wiKVxuICAgICAgc2JyID0gXCJcIlxuICAgICAgd2hpbGUgcy5sZW5ndGggPiAzMFxuICAgICAgICBzYnIgPSBzYnIgKyBzLnN1YnN0cmluZygwLCAzMCkgKyBcIjxicj5cIlxuICAgICAgICBzID0gcy5zdWJzdHJpbmcoMzAsIHMubGVuZ3RoKVxuICAgICAgc2JyID0gc2JyICsgc1xuICAgICAgc2JyXG5cbiAgICBjcmVhdGVOb2RlID0gKGcsIGRhdGEsIGVsLCBpc1BhcmVudCA9IGZhbHNlLCBtYXhXLCBtYXhIKSAtPlxuICAgICAgIyBjcmVhdGUgbm9kZSwgc2VuZCBhZGRpdGlvbmFsIGluZm9ybWF0aW9ucyBhYm91dCB0aGUgbm9kZSBpZiBpdCBpcyBhIHNwZWNpYWwgb25lXG4gICAgICBpZiBlbC5pZCBpcyBkYXRhLnBhcnRpYWxfc29sdXRpb25cbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwicGFydGlhbFNvbHV0aW9uXCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwicGFydGlhbFNvbHV0aW9uXCIpXG5cbiAgICAgIGVsc2UgaWYgZWwuaWQgaXMgZGF0YS5uZXh0X3BhcnRpYWxfc29sdXRpb25cbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIm5leHRQYXJ0aWFsU29sdXRpb25cIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLndvcmtzZXRcbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwid29ya3NldFwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIndvcmtzZXRcIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLm5leHRfd29ya3NldFxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJuZXh0V29ya3NldFwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIm5leHRXb3Jrc2V0XCIpXG5cbiAgICAgIGVsc2UgaWYgZWwuaWQgaXMgZGF0YS5zb2x1dGlvbl9zZXRcbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwic29sdXRpb25TZXRcIiwgbWF4VywgbWF4SClcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICAgIGNsYXNzOiBnZXROb2RlVHlwZShlbCwgXCJzb2x1dGlvblNldFwiKVxuXG4gICAgICBlbHNlIGlmIGVsLmlkIGlzIGRhdGEuc29sdXRpb25fZGVsdGFcbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwic29sdXRpb25EZWx0YVwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uRGVsdGFcIilcblxuICAgICAgZWxzZVxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJcIiwgbWF4VywgbWF4SClcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICAgIGNsYXNzOiBnZXROb2RlVHlwZShlbCwgXCJcIilcblxuICAgIGNyZWF0ZUVkZ2UgPSAoZywgZGF0YSwgZWwsIGV4aXN0aW5nTm9kZXMsIHByZWQpIC0+XG4gICAgICB1bmxlc3MgZXhpc3RpbmdOb2Rlcy5pbmRleE9mKHByZWQuaWQpIGlzIC0xXG4gICAgICAgIGcuc2V0RWRnZSBwcmVkLmlkLCBlbC5pZCxcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKHByZWQpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG5cbiAgICAgIGVsc2VcbiAgICAgICAgbWlzc2luZ05vZGUgPSBzZWFyY2hGb3JOb2RlKGRhdGEsIHByZWQuaWQpXG4gICAgICAgIHVubGVzcyAhbWlzc2luZ05vZGVcbiAgICAgICAgICBnLnNldEVkZ2UgbWlzc2luZ05vZGUuaWQsIGVsLmlkLFxuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsRWRnZShtaXNzaW5nTm9kZSlcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG5cbiAgICBsb2FkSnNvblRvRGFncmUgPSAoZywgZGF0YSkgLT5cbiAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXVxuXG4gICAgICBpZiBkYXRhLm5vZGVzP1xuICAgICAgICAjIFRoaXMgaXMgdGhlIG5vcm1hbCBqc29uIGRhdGFcbiAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5ub2Rlc1xuXG4gICAgICBlbHNlXG4gICAgICAgICMgVGhpcyBpcyBhbiBpdGVyYXRpb24sIHdlIG5vdyBzdG9yZSBzcGVjaWFsIGl0ZXJhdGlvbiBub2RlcyBpZiBwb3NzaWJsZVxuICAgICAgICB0b0l0ZXJhdGUgPSBkYXRhLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgaXNQYXJlbnQgPSB0cnVlXG5cbiAgICAgIGZvciBlbCBpbiB0b0l0ZXJhdGVcbiAgICAgICAgbWF4VyA9IDBcbiAgICAgICAgbWF4SCA9IDBcblxuICAgICAgICBpZiBlbC5zdGVwX2Z1bmN0aW9uXG4gICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICAgIG5vZGVzZXA6IDIwXG4gICAgICAgICAgICBlZGdlc2VwOiAwXG4gICAgICAgICAgICByYW5rc2VwOiAyMFxuICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiXG4gICAgICAgICAgICBtYXJnaW54OiAxMFxuICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICBzdWJncmFwaHNbZWwuaWRdID0gc2dcblxuICAgICAgICAgIGxvYWRKc29uVG9EYWdyZShzZywgZWwpXG5cbiAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKClcbiAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKVxuICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoXG4gICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0XG5cbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQobWFpblRtcEVsZW1lbnQpLmVtcHR5KClcblxuICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SClcblxuICAgICAgICBleGlzdGluZ05vZGVzLnB1c2ggZWwuaWRcbiAgICAgICAgXG4gICAgICAgICMgY3JlYXRlIGVkZ2VzIGZyb20gaW5wdXRzIHRvIGN1cnJlbnQgbm9kZVxuICAgICAgICBpZiBlbC5pbnB1dHM/XG4gICAgICAgICAgZm9yIHByZWQgaW4gZWwuaW5wdXRzXG4gICAgICAgICAgICBjcmVhdGVFZGdlKGcsIGRhdGEsIGVsLCBleGlzdGluZ05vZGVzLCBwcmVkKVxuXG4gICAgICBnXG5cbiAgICAjIHNlYXJjaGVzIGluIHRoZSBnbG9iYWwgSlNPTkRhdGEgZm9yIHRoZSBub2RlIHdpdGggdGhlIGdpdmVuIGlkXG4gICAgc2VhcmNoRm9yTm9kZSA9IChkYXRhLCBub2RlSUQpIC0+XG4gICAgICBmb3IgaSBvZiBkYXRhLm5vZGVzXG4gICAgICAgIGVsID0gZGF0YS5ub2Rlc1tpXVxuICAgICAgICByZXR1cm4gZWwgIGlmIGVsLmlkIGlzIG5vZGVJRFxuICAgICAgICBcbiAgICAgICAgIyBsb29rIGZvciBub2RlcyB0aGF0IGFyZSBpbiBpdGVyYXRpb25zXG4gICAgICAgIGlmIGVsLnN0ZXBfZnVuY3Rpb24/XG4gICAgICAgICAgZm9yIGogb2YgZWwuc3RlcF9mdW5jdGlvblxuICAgICAgICAgICAgcmV0dXJuIGVsLnN0ZXBfZnVuY3Rpb25bal0gIGlmIGVsLnN0ZXBfZnVuY3Rpb25bal0uaWQgaXMgbm9kZUlEXG5cbiAgICBkcmF3R3JhcGggPSAoZGF0YSkgLT5cbiAgICAgIGcgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pLnNldEdyYXBoKHtcbiAgICAgICAgbm9kZXNlcDogNzBcbiAgICAgICAgZWRnZXNlcDogMFxuICAgICAgICByYW5rc2VwOiA1MFxuICAgICAgICByYW5rZGlyOiBcIkxSXCJcbiAgICAgICAgbWFyZ2lueDogNDBcbiAgICAgICAgbWFyZ2lueTogNDBcbiAgICAgICAgfSlcblxuICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIGRhdGEpXG5cbiAgICAgIHJlbmRlcmVyID0gbmV3IGRhZ3JlRDMucmVuZGVyKClcbiAgICAgIGQzbWFpblN2Z0cuY2FsbChyZW5kZXJlciwgZylcblxuICAgICAgZm9yIGksIHNnIG9mIHN1YmdyYXBoc1xuICAgICAgICBkM21haW5Tdmcuc2VsZWN0KCdzdmcuc3ZnLScgKyBpICsgJyBnJykuY2FsbChyZW5kZXJlciwgc2cpXG5cbiAgICAgIG5ld1NjYWxlID0gMC41XG5cbiAgICAgIHhDZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKChhbmd1bGFyLmVsZW1lbnQobWFpblN2Z0VsZW1lbnQpLndpZHRoKCkgLSBnLmdyYXBoKCkud2lkdGggKiBuZXdTY2FsZSkgLyAyKVxuICAgICAgeUNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkuaGVpZ2h0KCkgLSBnLmdyYXBoKCkuaGVpZ2h0ICogbmV3U2NhbGUpIC8gMilcblxuICAgICAgbWFpblpvb20uc2NhbGUobmV3U2NhbGUpLnRyYW5zbGF0ZShbeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldF0pXG5cbiAgICAgIGQzbWFpblN2Z0cuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHhDZW50ZXJPZmZzZXQgKyBcIiwgXCIgKyB5Q2VudGVyT2Zmc2V0ICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiKVxuXG4gICAgICBtYWluWm9vbS5vbihcInpvb21cIiwgLT5cbiAgICAgICAgZXYgPSBkMy5ldmVudFxuICAgICAgICBkM21haW5TdmdHLmF0dHIgXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBldi50cmFuc2xhdGUgKyBcIikgc2NhbGUoXCIgKyBldi5zY2FsZSArIFwiKVwiXG4gICAgICApXG4gICAgICBtYWluWm9vbShkM21haW5TdmcpXG5cbiAgICAgIGQzbWFpblN2Z0cuc2VsZWN0QWxsKCcubm9kZScpLm9uICdjbGljaycsIChkKSAtPlxuICAgICAgICBzY29wZS5zZXROb2RlKHsgbm9kZWlkOiBkIH0pXG5cbiAgICBzY29wZS4kd2F0Y2ggYXR0cnMucGxhbiwgKG5ld1BsYW4pIC0+XG4gICAgICBkcmF3R3JhcGgobmV3UGxhbikgaWYgbmV3UGxhblxuXG4gICAgcmV0dXJuXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5kaXJlY3RpdmUoJ3ZlcnRleCcsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBcIjxzdmcgY2xhc3M9J3RpbWVsaW5lIHNlY29uZGFyeScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIGRhdGE6IFwiPVwiXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBhbmFseXplVGltZSwgY29udGFpbmVyVywgc3ZnRWw7XG4gICAgICBzdmdFbCA9IGVsZW0uY2hpbGRyZW4oKVswXTtcbiAgICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKCk7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoc3ZnRWwpLmF0dHIoJ3dpZHRoJywgY29udGFpbmVyVyk7XG4gICAgICBhbmFseXplVGltZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGNoYXJ0LCBzdmcsIHRlc3REYXRhO1xuICAgICAgICBkMy5zZWxlY3Qoc3ZnRWwpLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XG4gICAgICAgIHRlc3REYXRhID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLnN1YnRhc2tzLCBmdW5jdGlvbihzdWJ0YXNrLCBpKSB7XG4gICAgICAgICAgdmFyIHRpbWVzO1xuICAgICAgICAgIHRpbWVzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsYWJlbDogXCJTY2hlZHVsZWRcIixcbiAgICAgICAgICAgICAgY29sb3I6IFwiIzY2NlwiLFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCIsXG4gICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlNDSEVEVUxFRFwiXSxcbiAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXSxcbiAgICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkRlcGxveWluZ1wiLFxuICAgICAgICAgICAgICBjb2xvcjogXCIjYWFhXCIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIixcbiAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdLFxuICAgICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXSxcbiAgICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXTtcbiAgICAgICAgICBpZiAoc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0gPiAwKSB7XG4gICAgICAgICAgICB0aW1lcy5wdXNoKHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiUnVubmluZ1wiLFxuICAgICAgICAgICAgICBjb2xvcjogXCIjZGRkXCIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIixcbiAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXSxcbiAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkZJTklTSEVEXCJdLFxuICAgICAgICAgICAgICB0eXBlOiAncmVndWxhcidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGVzdERhdGEucHVzaCh7XG4gICAgICAgICAgICBsYWJlbDogXCIoXCIgKyBzdWJ0YXNrLnN1YnRhc2sgKyBcIikgXCIgKyBzdWJ0YXNrLmhvc3QsXG4gICAgICAgICAgICB0aW1lczogdGltZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpLnRpY2tGb3JtYXQoe1xuICAgICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKSxcbiAgICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgICB9KS5wcmVmaXgoXCJzaW5nbGVcIikubGFiZWxGb3JtYXQoZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgIH0pLm1hcmdpbih7XG4gICAgICAgICAgbGVmdDogMTAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgfSkuaXRlbUhlaWdodCgzMCkucmVsYXRpdmVUaW1lKCk7XG4gICAgICAgIHJldHVybiBzdmcgPSBkMy5zZWxlY3Qoc3ZnRWwpLmRhdHVtKHRlc3REYXRhKS5jYWxsKGNoYXJ0KTtcbiAgICAgIH07XG4gICAgICBhbmFseXplVGltZShzY29wZS5kYXRhKTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ3RpbWVsaW5lJywgZnVuY3Rpb24oJHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6IFwiPHN2ZyBjbGFzcz0ndGltZWxpbmUnIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiLFxuICAgIHNjb3BlOiB7XG4gICAgICB2ZXJ0aWNlczogXCI9XCIsXG4gICAgICBqb2JpZDogXCI9XCJcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xuICAgICAgdmFyIGFuYWx5emVUaW1lLCBjb250YWluZXJXLCBzdmdFbCwgdHJhbnNsYXRlTGFiZWw7XG4gICAgICBzdmdFbCA9IGVsZW0uY2hpbGRyZW4oKVswXTtcbiAgICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKCk7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoc3ZnRWwpLmF0dHIoJ3dpZHRoJywgY29udGFpbmVyVyk7XG4gICAgICB0cmFuc2xhdGVMYWJlbCA9IGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgIHJldHVybiBsYWJlbC5yZXBsYWNlKFwiJmd0O1wiLCBcIj5cIik7XG4gICAgICB9O1xuICAgICAgYW5hbHl6ZVRpbWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBjaGFydCwgc3ZnLCB0ZXN0RGF0YTtcbiAgICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICAgICAgICB0ZXN0RGF0YSA9IFtdO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmVydGV4KSB7XG4gICAgICAgICAgaWYgKHZlcnRleFsnc3RhcnQtdGltZSddID4gLTEpIHtcbiAgICAgICAgICAgIGlmICh2ZXJ0ZXgudHlwZSA9PT0gJ3NjaGVkdWxlZCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRlc3REYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIHRpbWVzOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVMYWJlbCh2ZXJ0ZXgubmFtZSksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNjY2NjY2NcIixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NTU1NVwiLFxuICAgICAgICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHZlcnRleFsnZW5kLXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRlc3REYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIHRpbWVzOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVMYWJlbCh2ZXJ0ZXgubmFtZSksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNkOWYxZjdcIixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzYyY2RlYVwiLFxuICAgICAgICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHZlcnRleFsnZW5kLXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgbGluazogdmVydGV4LmlkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB2ZXJ0ZXgudHlwZVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2hhcnQgPSBkMy50aW1lbGluZSgpLnN0YWNrKCkuY2xpY2soZnVuY3Rpb24oZCwgaSwgZGF0dW0pIHtcbiAgICAgICAgICBpZiAoZC5saW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gJHN0YXRlLmdvKFwic2luZ2xlLWpvYi50aW1lbGluZS52ZXJ0ZXhcIiwge1xuICAgICAgICAgICAgICBqb2JpZDogc2NvcGUuam9iaWQsXG4gICAgICAgICAgICAgIHZlcnRleElkOiBkLmxpbmtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkudGlja0Zvcm1hdCh7XG4gICAgICAgICAgZm9ybWF0OiBkMy50aW1lLmZvcm1hdChcIiVMXCIpLFxuICAgICAgICAgIHRpY2tTaXplOiAxXG4gICAgICAgIH0pLnByZWZpeChcIm1haW5cIikubWFyZ2luKHtcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgfSkuaXRlbUhlaWdodCgzMCkuc2hvd0JvcmRlckxpbmUoKS5zaG93SG91clRpbWVsaW5lKCk7XG4gICAgICAgIHJldHVybiBzdmcgPSBkMy5zZWxlY3Qoc3ZnRWwpLmRhdHVtKHRlc3REYXRhKS5jYWxsKGNoYXJ0KTtcbiAgICAgIH07XG4gICAgICBzY29wZS4kd2F0Y2goYXR0cnMudmVydGljZXMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gYW5hbHl6ZVRpbWUoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnam9iUGxhbicsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6IFwiPHN2ZyBjbGFzcz0nZ3JhcGgnIHdpZHRoPSc1MDAnIGhlaWdodD0nNDAwJz48ZyAvPjwvc3ZnPiA8c3ZnIGNsYXNzPSd0bXAnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxnIC8+PC9zdmc+IDxkaXYgY2xhc3M9J2J0bi1ncm91cCB6b29tLWJ1dHRvbnMnPiA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20taW4nIG5nLWNsaWNrPSd6b29tSW4oKSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMnIC8+PC9hPiA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20tb3V0JyBuZy1jbGljaz0nem9vbU91dCgpJz48aSBjbGFzcz0nZmEgZmEtbWludXMnIC8+PC9hPiA8L2Rpdj5cIixcbiAgICBzY29wZToge1xuICAgICAgcGxhbjogJz0nLFxuICAgICAgc2V0Tm9kZTogJyYnXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBjb250YWluZXJXLCBjcmVhdGVFZGdlLCBjcmVhdGVMYWJlbEVkZ2UsIGNyZWF0ZUxhYmVsTm9kZSwgY3JlYXRlTm9kZSwgZDNtYWluU3ZnLCBkM21haW5TdmdHLCBkM3RtcFN2ZywgZHJhd0dyYXBoLCBleHRlbmRMYWJlbE5vZGVGb3JJdGVyYXRpb24sIGcsIGdldE5vZGVUeXBlLCBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlLCBqb2JpZCwgbG9hZEpzb25Ub0RhZ3JlLCBtYWluRywgbWFpblN2Z0VsZW1lbnQsIG1haW5UbXBFbGVtZW50LCBtYWluWm9vbSwgc2VhcmNoRm9yTm9kZSwgc2hvcnRlblN0cmluZywgc3ViZ3JhcGhzO1xuICAgICAgZyA9IG51bGw7XG4gICAgICBtYWluWm9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKTtcbiAgICAgIHN1YmdyYXBocyA9IFtdO1xuICAgICAgam9iaWQgPSBhdHRycy5qb2JpZDtcbiAgICAgIG1haW5TdmdFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzBdO1xuICAgICAgbWFpbkcgPSBlbGVtLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVswXTtcbiAgICAgIG1haW5UbXBFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzFdO1xuICAgICAgZDNtYWluU3ZnID0gZDMuc2VsZWN0KG1haW5TdmdFbGVtZW50KTtcbiAgICAgIGQzbWFpblN2Z0cgPSBkMy5zZWxlY3QobWFpbkcpO1xuICAgICAgZDN0bXBTdmcgPSBkMy5zZWxlY3QobWFpblRtcEVsZW1lbnQpO1xuICAgICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtLmNoaWxkcmVuKClbMF0pLndpZHRoKGNvbnRhaW5lclcpO1xuICAgICAgc2NvcGUuem9vbUluID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0cmFuc2xhdGUsIHYxLCB2MjtcbiAgICAgICAgaWYgKG1haW5ab29tLnNjYWxlKCkgPCAyLjk5KSB7XG4gICAgICAgICAgdHJhbnNsYXRlID0gbWFpblpvb20udHJhbnNsYXRlKCk7XG4gICAgICAgICAgdjEgPSB0cmFuc2xhdGVbMF0gKiAobWFpblpvb20uc2NhbGUoKSArIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgdjIgPSB0cmFuc2xhdGVbMV0gKiAobWFpblpvb20uc2NhbGUoKSArIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgbWFpblpvb20uc2NhbGUobWFpblpvb20uc2NhbGUoKSArIDAuMSk7XG4gICAgICAgICAgbWFpblpvb20udHJhbnNsYXRlKFt2MSwgdjJdKTtcbiAgICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLnpvb21PdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZSwgdjEsIHYyO1xuICAgICAgICBpZiAobWFpblpvb20uc2NhbGUoKSA+IDAuMzEpIHtcbiAgICAgICAgICBtYWluWm9vbS5zY2FsZShtYWluWm9vbS5zY2FsZSgpIC0gMC4xKTtcbiAgICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKTtcbiAgICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKTtcbiAgICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKTtcbiAgICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUoW3YxLCB2Ml0pO1xuICAgICAgICAgIHJldHVybiBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB2MSArIFwiLFwiICsgdjIgKyBcIikgc2NhbGUoXCIgKyBtYWluWm9vbS5zY2FsZSgpICsgXCIpXCIpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY3JlYXRlTGFiZWxFZGdlID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGxhYmVsVmFsdWU7XG4gICAgICAgIGxhYmVsVmFsdWUgPSBcIlwiO1xuICAgICAgICBpZiAoKGVsLnNoaXBfc3RyYXRlZ3kgIT0gbnVsbCkgfHwgKGVsLmxvY2FsX3N0cmF0ZWd5ICE9IG51bGwpKSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxkaXYgY2xhc3M9J2VkZ2UtbGFiZWwnPlwiO1xuICAgICAgICAgIGlmIChlbC5zaGlwX3N0cmF0ZWd5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gZWwuc2hpcF9zdHJhdGVneTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLnRlbXBfbW9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiIChcIiArIGVsLnRlbXBfbW9kZSArIFwiKVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWwubG9jYWxfc3RyYXRlZ3kgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjwvZGl2PlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYWJlbFZhbHVlO1xuICAgICAgfTtcbiAgICAgIGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUgPSBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHJldHVybiBpbmZvID09PSBcInBhcnRpYWxTb2x1dGlvblwiIHx8IGluZm8gPT09IFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIHx8IGluZm8gPT09IFwid29ya3NldFwiIHx8IGluZm8gPT09IFwibmV4dFdvcmtzZXRcIiB8fCBpbmZvID09PSBcInNvbHV0aW9uU2V0XCIgfHwgaW5mbyA9PT0gXCJzb2x1dGlvbkRlbHRhXCI7XG4gICAgICB9O1xuICAgICAgZ2V0Tm9kZVR5cGUgPSBmdW5jdGlvbihlbCwgaW5mbykge1xuICAgICAgICBpZiAoaW5mbyA9PT0gXCJtaXJyb3JcIikge1xuICAgICAgICAgIHJldHVybiAnbm9kZS1taXJyb3InO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUoaW5mbykpIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtaXRlcmF0aW9uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtbm9ybWFsJztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNyZWF0ZUxhYmVsTm9kZSA9IGZ1bmN0aW9uKGVsLCBpbmZvLCBtYXhXLCBtYXhIKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlLCBzdGVwTmFtZTtcbiAgICAgICAgbGFiZWxWYWx1ZSA9IFwiPGRpdiBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiO1xuICAgICAgICBpZiAoaW5mbyA9PT0gXCJtaXJyb3JcIikge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+TWlycm9yIG9mIFwiICsgZWwub3BlcmF0b3IgKyBcIjwvaDM+XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoMyBjbGFzcz0nbm9kZS1uYW1lJz5cIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5kZXNjcmlwdGlvbiA9PT0gXCJcIikge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCJcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGVwTmFtZSA9IGVsLmRlc2NyaXB0aW9uO1xuICAgICAgICAgIHN0ZXBOYW1lID0gc2hvcnRlblN0cmluZyhzdGVwTmFtZSk7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNCBjbGFzcz0nc3RlcC1uYW1lJz5cIiArIHN0ZXBOYW1lICsgXCI8L2g0PlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5zdGVwX2Z1bmN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICBsYWJlbFZhbHVlICs9IGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbihlbC5pZCwgbWF4VywgbWF4SCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUoaW5mbykpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+XCIgKyBpbmZvICsgXCIgTm9kZTwvaDU+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbC5wYXJhbGxlbGlzbSAhPT0gXCJcIikge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5QYXJhbGxlbGlzbTogXCIgKyBlbC5wYXJhbGxlbGlzbSArIFwiPC9oNT5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLm9wZXJhdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+T3BlcmF0aW9uOiBcIiArIHNob3J0ZW5TdHJpbmcoZWwub3BlcmF0b3Jfc3RyYXRlZ3kpICsgXCI8L2g1PlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPC9kaXY+XCI7XG4gICAgICAgIHJldHVybiBsYWJlbFZhbHVlO1xuICAgICAgfTtcbiAgICAgIGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbiA9IGZ1bmN0aW9uKGlkLCBtYXhXLCBtYXhIKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlLCBzdmdJRDtcbiAgICAgICAgc3ZnSUQgPSBcInN2Zy1cIiArIGlkO1xuICAgICAgICBsYWJlbFZhbHVlID0gXCI8c3ZnIGNsYXNzPSdcIiArIHN2Z0lEICsgXCInIHdpZHRoPVwiICsgbWF4VyArIFwiIGhlaWdodD1cIiArIG1heEggKyBcIj48ZyAvPjwvc3ZnPlwiO1xuICAgICAgICByZXR1cm4gbGFiZWxWYWx1ZTtcbiAgICAgIH07XG4gICAgICBzaG9ydGVuU3RyaW5nID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgc2JyO1xuICAgICAgICBpZiAocy5jaGFyQXQoMCkgPT09IFwiPFwiKSB7XG4gICAgICAgICAgcyA9IHMucmVwbGFjZShcIjxcIiwgXCImbHQ7XCIpO1xuICAgICAgICAgIHMgPSBzLnJlcGxhY2UoXCI+XCIsIFwiJmd0O1wiKTtcbiAgICAgICAgfVxuICAgICAgICBzYnIgPSBcIlwiO1xuICAgICAgICB3aGlsZSAocy5sZW5ndGggPiAzMCkge1xuICAgICAgICAgIHNiciA9IHNiciArIHMuc3Vic3RyaW5nKDAsIDMwKSArIFwiPGJyPlwiO1xuICAgICAgICAgIHMgPSBzLnN1YnN0cmluZygzMCwgcy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHNiciA9IHNiciArIHM7XG4gICAgICAgIHJldHVybiBzYnI7XG4gICAgICB9O1xuICAgICAgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SCkge1xuICAgICAgICBpZiAoaXNQYXJlbnQgPT0gbnVsbCkge1xuICAgICAgICAgIGlzUGFyZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsLmlkID09PSBkYXRhLnBhcnRpYWxfc29sdXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInBhcnRpYWxTb2x1dGlvblwiLCBtYXhXLCBtYXhIKSxcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgXCJjbGFzc1wiOiBnZXROb2RlVHlwZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5uZXh0X3BhcnRpYWxfc29sdXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIm5leHRQYXJ0aWFsU29sdXRpb25cIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLndvcmtzZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIndvcmtzZXRcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwid29ya3NldFwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLm5leHRfd29ya3NldCkge1xuICAgICAgICAgIHJldHVybiBnLnNldE5vZGUoZWwuaWQsIHtcbiAgICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwibmV4dFdvcmtzZXRcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFdvcmtzZXRcIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5zb2x1dGlvbl9zZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInNvbHV0aW9uU2V0XCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uU2V0XCIpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuaWQgPT09IGRhdGEuc29sdXRpb25fZGVsdGEpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInNvbHV0aW9uRGVsdGFcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwic29sdXRpb25EZWx0YVwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBnLnNldE5vZGUoZWwuaWQsIHtcbiAgICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwiXCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcIlwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY3JlYXRlRWRnZSA9IGZ1bmN0aW9uKGcsIGRhdGEsIGVsLCBleGlzdGluZ05vZGVzLCBwcmVkKSB7XG4gICAgICAgIHZhciBtaXNzaW5nTm9kZTtcbiAgICAgICAgaWYgKGV4aXN0aW5nTm9kZXMuaW5kZXhPZihwcmVkLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXRFZGdlKHByZWQuaWQsIGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKHByZWQpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWlzc2luZ05vZGUgPSBzZWFyY2hGb3JOb2RlKGRhdGEsIHByZWQuaWQpO1xuICAgICAgICAgIGlmICghIW1pc3NpbmdOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gZy5zZXRFZGdlKG1pc3NpbmdOb2RlLmlkLCBlbC5pZCwge1xuICAgICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKG1pc3NpbmdOb2RlKSxcbiAgICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGxvYWRKc29uVG9EYWdyZSA9IGZ1bmN0aW9uKGcsIGRhdGEpIHtcbiAgICAgICAgdmFyIGVsLCBleGlzdGluZ05vZGVzLCBpc1BhcmVudCwgaywgbCwgbGVuLCBsZW4xLCBtYXhILCBtYXhXLCBwcmVkLCByLCByZWYsIHNnLCB0b0l0ZXJhdGU7XG4gICAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXTtcbiAgICAgICAgaWYgKGRhdGEubm9kZXMgIT0gbnVsbCkge1xuICAgICAgICAgIHRvSXRlcmF0ZSA9IGRhdGEubm9kZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5zdGVwX2Z1bmN0aW9uO1xuICAgICAgICAgIGlzUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSB0b0l0ZXJhdGUubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICBlbCA9IHRvSXRlcmF0ZVtrXTtcbiAgICAgICAgICBtYXhXID0gMDtcbiAgICAgICAgICBtYXhIID0gMDtcbiAgICAgICAgICBpZiAoZWwuc3RlcF9mdW5jdGlvbikge1xuICAgICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7XG4gICAgICAgICAgICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgICAgICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICAgICAgICB9KS5zZXRHcmFwaCh7XG4gICAgICAgICAgICAgIG5vZGVzZXA6IDIwLFxuICAgICAgICAgICAgICBlZGdlc2VwOiAwLFxuICAgICAgICAgICAgICByYW5rc2VwOiAyMCxcbiAgICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiLFxuICAgICAgICAgICAgICBtYXJnaW54OiAxMCxcbiAgICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3ViZ3JhcGhzW2VsLmlkXSA9IHNnO1xuICAgICAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKHNnLCBlbCk7XG4gICAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKCk7XG4gICAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKTtcbiAgICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoO1xuICAgICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0O1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG1haW5UbXBFbGVtZW50KS5lbXB0eSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SCk7XG4gICAgICAgICAgZXhpc3RpbmdOb2Rlcy5wdXNoKGVsLmlkKTtcbiAgICAgICAgICBpZiAoZWwuaW5wdXRzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlZiA9IGVsLmlucHV0cztcbiAgICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICAgIHByZWQgPSByZWZbbF07XG4gICAgICAgICAgICAgIGNyZWF0ZUVkZ2UoZywgZGF0YSwgZWwsIGV4aXN0aW5nTm9kZXMsIHByZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZztcbiAgICAgIH07XG4gICAgICBzZWFyY2hGb3JOb2RlID0gZnVuY3Rpb24oZGF0YSwgbm9kZUlEKSB7XG4gICAgICAgIHZhciBlbCwgaSwgajtcbiAgICAgICAgZm9yIChpIGluIGRhdGEubm9kZXMpIHtcbiAgICAgICAgICBlbCA9IGRhdGEubm9kZXNbaV07XG4gICAgICAgICAgaWYgKGVsLmlkID09PSBub2RlSUQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLnN0ZXBfZnVuY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yIChqIGluIGVsLnN0ZXBfZnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgaWYgKGVsLnN0ZXBfZnVuY3Rpb25bal0uaWQgPT09IG5vZGVJRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5zdGVwX2Z1bmN0aW9uW2pdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZHJhd0dyYXBoID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaSwgbmV3U2NhbGUsIHJlbmRlcmVyLCBzZywgeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldDtcbiAgICAgICAgZyA9IG5ldyBkYWdyZUQzLmdyYXBobGliLkdyYXBoKHtcbiAgICAgICAgICBtdWx0aWdyYXBoOiB0cnVlLFxuICAgICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICAgIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICBub2Rlc2VwOiA3MCxcbiAgICAgICAgICBlZGdlc2VwOiAwLFxuICAgICAgICAgIHJhbmtzZXA6IDUwLFxuICAgICAgICAgIHJhbmtkaXI6IFwiTFJcIixcbiAgICAgICAgICBtYXJnaW54OiA0MCxcbiAgICAgICAgICBtYXJnaW55OiA0MFxuICAgICAgICB9KTtcbiAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIGRhdGEpO1xuICAgICAgICByZW5kZXJlciA9IG5ldyBkYWdyZUQzLnJlbmRlcigpO1xuICAgICAgICBkM21haW5TdmdHLmNhbGwocmVuZGVyZXIsIGcpO1xuICAgICAgICBmb3IgKGkgaW4gc3ViZ3JhcGhzKSB7XG4gICAgICAgICAgc2cgPSBzdWJncmFwaHNbaV07XG4gICAgICAgICAgZDNtYWluU3ZnLnNlbGVjdCgnc3ZnLnN2Zy0nICsgaSArICcgZycpLmNhbGwocmVuZGVyZXIsIHNnKTtcbiAgICAgICAgfVxuICAgICAgICBuZXdTY2FsZSA9IDAuNTtcbiAgICAgICAgeENlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkud2lkdGgoKSAtIGcuZ3JhcGgoKS53aWR0aCAqIG5ld1NjYWxlKSAvIDIpO1xuICAgICAgICB5Q2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcigoYW5ndWxhci5lbGVtZW50KG1haW5TdmdFbGVtZW50KS5oZWlnaHQoKSAtIGcuZ3JhcGgoKS5oZWlnaHQgKiBuZXdTY2FsZSkgLyAyKTtcbiAgICAgICAgbWFpblpvb20uc2NhbGUobmV3U2NhbGUpLnRyYW5zbGF0ZShbeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldF0pO1xuICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB4Q2VudGVyT2Zmc2V0ICsgXCIsIFwiICsgeUNlbnRlck9mZnNldCArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIik7XG4gICAgICAgIG1haW5ab29tLm9uKFwiem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXY7XG4gICAgICAgICAgZXYgPSBkMy5ldmVudDtcbiAgICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgZXYudHJhbnNsYXRlICsgXCIpIHNjYWxlKFwiICsgZXYuc2NhbGUgKyBcIilcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBtYWluWm9vbShkM21haW5TdmcpO1xuICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5zZWxlY3RBbGwoJy5ub2RlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBzY29wZS5zZXROb2RlKHtcbiAgICAgICAgICAgIG5vZGVpZDogZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBzY29wZS4kd2F0Y2goYXR0cnMucGxhbiwgZnVuY3Rpb24obmV3UGxhbikge1xuICAgICAgICBpZiAobmV3UGxhbikge1xuICAgICAgICAgIHJldHVybiBkcmF3R3JhcGgobmV3UGxhbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JzU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRsb2csIGFtTW9tZW50LCAkcSwgJHRpbWVvdXQpIC0+XG4gIGN1cnJlbnRKb2IgPSBudWxsXG4gIGN1cnJlbnRQbGFuID0gbnVsbFxuXG4gIGRlZmVycmVkcyA9IHt9XG4gIGpvYnMgPSB7XG4gICAgcnVubmluZzogW11cbiAgICBmaW5pc2hlZDogW11cbiAgICBjYW5jZWxsZWQ6IFtdXG4gICAgZmFpbGVkOiBbXVxuICB9XG5cbiAgam9iT2JzZXJ2ZXJzID0gW11cblxuICBub3RpZnlPYnNlcnZlcnMgPSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBqb2JPYnNlcnZlcnMsIChjYWxsYmFjaykgLT5cbiAgICAgIGNhbGxiYWNrKClcblxuICBAcmVnaXN0ZXJPYnNlcnZlciA9IChjYWxsYmFjaykgLT5cbiAgICBqb2JPYnNlcnZlcnMucHVzaChjYWxsYmFjaylcblxuICBAdW5SZWdpc3Rlck9ic2VydmVyID0gKGNhbGxiYWNrKSAtPlxuICAgIGluZGV4ID0gam9iT2JzZXJ2ZXJzLmluZGV4T2YoY2FsbGJhY2spXG4gICAgam9iT2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSlcblxuICBAc3RhdGVMaXN0ID0gLT5cbiAgICBbIFxuICAgICAgIyAnQ1JFQVRFRCdcbiAgICAgICdTQ0hFRFVMRUQnXG4gICAgICAnREVQTE9ZSU5HJ1xuICAgICAgJ1JVTk5JTkcnXG4gICAgICAnRklOSVNIRUQnXG4gICAgICAnRkFJTEVEJ1xuICAgICAgJ0NBTkNFTElORydcbiAgICAgICdDQU5DRUxFRCdcbiAgICBdXG5cbiAgQHRyYW5zbGF0ZUxhYmVsU3RhdGUgPSAoc3RhdGUpIC0+XG4gICAgc3dpdGNoIHN0YXRlLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoZW4gJ2ZpbmlzaGVkJyB0aGVuICdzdWNjZXNzJ1xuICAgICAgd2hlbiAnZmFpbGVkJyB0aGVuICdkYW5nZXInXG4gICAgICB3aGVuICdzY2hlZHVsZWQnIHRoZW4gJ2RlZmF1bHQnXG4gICAgICB3aGVuICdkZXBsb3lpbmcnIHRoZW4gJ2luZm8nXG4gICAgICB3aGVuICdydW5uaW5nJyB0aGVuICdwcmltYXJ5J1xuICAgICAgd2hlbiAnY2FuY2VsaW5nJyB0aGVuICd3YXJuaW5nJ1xuICAgICAgd2hlbiAncGVuZGluZycgdGhlbiAnaW5mbydcbiAgICAgIHdoZW4gJ3RvdGFsJyB0aGVuICdibGFjaydcbiAgICAgIGVsc2UgJ2RlZmF1bHQnXG5cbiAgQHNldEVuZFRpbWVzID0gKGxpc3QpIC0+XG4gICAgYW5ndWxhci5mb3JFYWNoIGxpc3QsIChpdGVtLCBqb2JLZXkpIC0+XG4gICAgICB1bmxlc3MgaXRlbVsnZW5kLXRpbWUnXSA+IC0xXG4gICAgICAgIGl0ZW1bJ2VuZC10aW1lJ10gPSBpdGVtWydzdGFydC10aW1lJ10gKyBpdGVtWydkdXJhdGlvbiddXG5cbiAgQHByb2Nlc3NWZXJ0aWNlcyA9IChkYXRhKSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLnZlcnRpY2VzLCAodmVydGV4LCBpKSAtPlxuICAgICAgdmVydGV4LnR5cGUgPSAncmVndWxhcidcblxuICAgIGRhdGEudmVydGljZXMudW5zaGlmdCh7XG4gICAgICBuYW1lOiAnU2NoZWR1bGVkJ1xuICAgICAgJ3N0YXJ0LXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXVxuICAgICAgJ2VuZC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ10gKyAxXG4gICAgICB0eXBlOiAnc2NoZWR1bGVkJ1xuICAgIH0pXG5cbiAgQGxpc3RKb2JzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm92ZXJ2aWV3XCJcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICBhbmd1bGFyLmZvckVhY2ggZGF0YSwgKGxpc3QsIGxpc3RLZXkpID0+XG4gICAgICAgIHN3aXRjaCBsaXN0S2V5XG4gICAgICAgICAgd2hlbiAncnVubmluZycgdGhlbiBqb2JzLnJ1bm5pbmcgPSBAc2V0RW5kVGltZXMobGlzdClcbiAgICAgICAgICB3aGVuICdmaW5pc2hlZCcgdGhlbiBqb2JzLmZpbmlzaGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnY2FuY2VsbGVkJyB0aGVuIGpvYnMuY2FuY2VsbGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnZmFpbGVkJyB0aGVuIGpvYnMuZmFpbGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoam9icylcbiAgICAgIG5vdGlmeU9ic2VydmVycygpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldEpvYnMgPSAodHlwZSkgLT5cbiAgICBqb2JzW3R5cGVdXG5cbiAgQGdldEFsbEpvYnMgPSAtPlxuICAgIGpvYnNcblxuICBAbG9hZEpvYiA9IChqb2JpZCkgLT5cbiAgICBjdXJyZW50Sm9iID0gbnVsbFxuICAgIGRlZmVycmVkcy5qb2IgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWRcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICBAc2V0RW5kVGltZXMoZGF0YS52ZXJ0aWNlcylcbiAgICAgIEBwcm9jZXNzVmVydGljZXMoZGF0YSlcblxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvY29uZmlnXCJcbiAgICAgIC5zdWNjZXNzIChqb2JDb25maWcpIC0+XG4gICAgICAgIGRhdGEgPSBhbmd1bGFyLmV4dGVuZChkYXRhLCBqb2JDb25maWcpXG5cbiAgICAgICAgY3VycmVudEpvYiA9IGRhdGFcblxuICAgICAgICBkZWZlcnJlZHMuam9iLnJlc29sdmUoY3VycmVudEpvYilcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZVxuXG4gIEBnZXROb2RlID0gKG5vZGVpZCkgLT5cbiAgICBzZWVrTm9kZSA9IChub2RlaWQsIGRhdGEpIC0+XG4gICAgICBmb3Igbm9kZSBpbiBkYXRhXG4gICAgICAgIHJldHVybiBub2RlIGlmIG5vZGUuaWQgaXMgbm9kZWlkXG4gICAgICAgIHN1YiA9IHNlZWtOb2RlKG5vZGVpZCwgbm9kZS5zdGVwX2Z1bmN0aW9uKSBpZiBub2RlLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgcmV0dXJuIHN1YiBpZiBzdWJcblxuICAgICAgbnVsbFxuXG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgIGZvdW5kTm9kZSA9IHNlZWtOb2RlKG5vZGVpZCwgY3VycmVudEpvYi5wbGFuLm5vZGVzKVxuXG4gICAgICBmb3VuZE5vZGUudmVydGV4ID0gQHNlZWtWZXJ0ZXgobm9kZWlkKVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZvdW5kTm9kZSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAc2Vla1ZlcnRleCA9IChub2RlaWQpIC0+XG4gICAgZm9yIHZlcnRleCBpbiBjdXJyZW50Sm9iLnZlcnRpY2VzXG4gICAgICByZXR1cm4gdmVydGV4IGlmIHZlcnRleC5pZCBpcyBub2RlaWRcblxuICAgIHJldHVybiBudWxsXG5cbiAgQGdldFZlcnRleCA9ICh2ZXJ0ZXhpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgdmVydGV4ID0gQHNlZWtWZXJ0ZXgodmVydGV4aWQpXG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9zdWJ0YXNrdGltZXNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICAgICMgVE9ETzogY2hhbmdlIHRvIHN1YnRhc2t0aW1lc1xuICAgICAgICB2ZXJ0ZXguc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2ZXJ0ZXgpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldFN1YnRhc2tzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzdWJ0YXNrcylcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZ2V0VGFza01hbmFnZXJzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvdGFza21hbmFnZXJzXCJcbiAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICB0YXNrbWFuYWdlcnMgPSBkYXRhLnRhc2ttYW5hZ2Vyc1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodGFza21hbmFnZXJzKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRBY2N1bXVsYXRvcnMgPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgICMgdmVydGV4ID0gQHNlZWtWZXJ0ZXgodmVydGV4aWQpXG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9hY2N1bXVsYXRvcnNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgIGFjY3VtdWxhdG9ycyA9IGRhdGFbJ3VzZXItYWNjdW11bGF0b3JzJ11cblxuICAgICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3MvYWNjdW11bGF0b3JzXCJcbiAgICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgICAgc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3NcblxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeyBtYWluOiBhY2N1bXVsYXRvcnMsIHN1YnRhc2tzOiBzdWJ0YXNrQWNjdW11bGF0b3JzIH0pXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgIyBKb2ItbGV2ZWwgY2hlY2twb2ludCBzdGF0c1xuICBAZ2V0Sm9iQ2hlY2twb2ludFN0YXRzID0gKGpvYmlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvY2hlY2twb2ludHNcIlxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgPT5cbiAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGVmZXJyZWQucmVzb2x2ZShudWxsKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgT3BlcmF0b3ItbGV2ZWwgY2hlY2twb2ludCBzdGF0c1xuICBAZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9jaGVja3BvaW50c1wiXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgIyBJZiBubyBkYXRhIGF2YWlsYWJsZSwgd2UgYXJlIGRvbmUuXG4gICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7IG9wZXJhdG9yU3RhdHM6IG51bGwsIHN1YnRhc2tzU3RhdHM6IG51bGwgfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdG9yU3RhdHMgPSB7IGlkOiBkYXRhWydpZCddLCB0aW1lc3RhbXA6IGRhdGFbJ3RpbWVzdGFtcCddLCBkdXJhdGlvbjogZGF0YVsnZHVyYXRpb24nXSwgc2l6ZTogZGF0YVsnc2l6ZSddIH1cblxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YVsnc3VidGFza3MnXSkpXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsgb3BlcmF0b3JTdGF0czogb3BlcmF0b3JTdGF0cywgc3VidGFza3NTdGF0czogbnVsbCB9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN1YnRhc2tTdGF0cyA9IGRhdGFbJ3N1YnRhc2tzJ11cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeyBvcGVyYXRvclN0YXRzOiBvcGVyYXRvclN0YXRzLCBzdWJ0YXNrc1N0YXRzOiBzdWJ0YXNrU3RhdHMgfSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIE9wZXJhdG9yLWxldmVsIGJhY2sgcHJlc3N1cmUgc3RhdHNcbiAgQGdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2JhY2twcmVzc3VyZVwiXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQHRyYW5zbGF0ZUJhY2tQcmVzc3VyZUxhYmVsU3RhdGUgPSAoc3RhdGUpIC0+XG4gICAgc3dpdGNoIHN0YXRlLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoZW4gJ2luLXByb2dyZXNzJyB0aGVuICdkYW5nZXInXG4gICAgICB3aGVuICdvaycgdGhlbiAnc3VjY2VzcydcbiAgICAgIHdoZW4gJ2xvdycgdGhlbiAnd2FybmluZydcbiAgICAgIHdoZW4gJ2hpZ2gnIHRoZW4gJ2RhbmdlcidcbiAgICAgIGVsc2UgJ2RlZmF1bHQnXG5cbiAgQGxvYWRFeGNlcHRpb25zID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9leGNlcHRpb25zXCJcbiAgICAgIC5zdWNjZXNzIChleGNlcHRpb25zKSAtPlxuICAgICAgICBjdXJyZW50Sm9iLmV4Y2VwdGlvbnMgPSBleGNlcHRpb25zXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShleGNlcHRpb25zKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBjYW5jZWxKb2IgPSAoam9iaWQpIC0+XG4gICAgIyB1c2VzIHRoZSBub24gUkVTVC1jb21wbGlhbnQgR0VUIHlhcm4tY2FuY2VsIGhhbmRsZXIgd2hpY2ggaXMgYXZhaWxhYmxlIGluIGFkZGl0aW9uIHRvIHRoZVxuICAgICMgcHJvcGVyIFwiREVMRVRFIGpvYnMvPGpvYmlkPi9cIlxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3lhcm4tY2FuY2VsXCJcblxuICBAc3RvcEpvYiA9IChqb2JpZCkgLT5cbiAgICAjIHVzZXMgdGhlIG5vbiBSRVNULWNvbXBsaWFudCBHRVQgeWFybi1jYW5jZWwgaGFuZGxlciB3aGljaCBpcyBhdmFpbGFibGUgaW4gYWRkaXRpb24gdG8gdGhlXG4gICAgIyBwcm9wZXIgXCJERUxFVEUgam9icy88am9iaWQ+L1wiXG4gICAgJGh0dHAuZ2V0IFwiam9icy9cIiArIGpvYmlkICsgXCIveWFybi1zdG9wXCJcblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdKb2JzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJGxvZywgYW1Nb21lbnQsICRxLCAkdGltZW91dCkge1xuICB2YXIgY3VycmVudEpvYiwgY3VycmVudFBsYW4sIGRlZmVycmVkcywgam9iT2JzZXJ2ZXJzLCBqb2JzLCBub3RpZnlPYnNlcnZlcnM7XG4gIGN1cnJlbnRKb2IgPSBudWxsO1xuICBjdXJyZW50UGxhbiA9IG51bGw7XG4gIGRlZmVycmVkcyA9IHt9O1xuICBqb2JzID0ge1xuICAgIHJ1bm5pbmc6IFtdLFxuICAgIGZpbmlzaGVkOiBbXSxcbiAgICBjYW5jZWxsZWQ6IFtdLFxuICAgIGZhaWxlZDogW11cbiAgfTtcbiAgam9iT2JzZXJ2ZXJzID0gW107XG4gIG5vdGlmeU9ic2VydmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2goam9iT2JzZXJ2ZXJzLCBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH07XG4gIHRoaXMucmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGpvYk9ic2VydmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcbiAgdGhpcy51blJlZ2lzdGVyT2JzZXJ2ZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IGpvYk9ic2VydmVycy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gam9iT2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH07XG4gIHRoaXMuc3RhdGVMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFsnU0NIRURVTEVEJywgJ0RFUExPWUlORycsICdSVU5OSU5HJywgJ0ZJTklTSEVEJywgJ0ZBSUxFRCcsICdDQU5DRUxJTkcnLCAnQ0FOQ0VMRUQnXTtcbiAgfTtcbiAgdGhpcy50cmFuc2xhdGVMYWJlbFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2ZpbmlzaGVkJzpcbiAgICAgICAgcmV0dXJuICdzdWNjZXNzJztcbiAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgIHJldHVybiAnZGFuZ2VyJztcbiAgICAgIGNhc2UgJ3NjaGVkdWxlZCc6XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCc7XG4gICAgICBjYXNlICdkZXBsb3lpbmcnOlxuICAgICAgICByZXR1cm4gJ2luZm8nO1xuICAgICAgY2FzZSAncnVubmluZyc6XG4gICAgICAgIHJldHVybiAncHJpbWFyeSc7XG4gICAgICBjYXNlICdjYW5jZWxpbmcnOlxuICAgICAgICByZXR1cm4gJ3dhcm5pbmcnO1xuICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgICBjYXNlICd0b3RhbCc6XG4gICAgICAgIHJldHVybiAnYmxhY2snO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0JztcbiAgICB9XG4gIH07XG4gIHRoaXMuc2V0RW5kVGltZXMgPSBmdW5jdGlvbihsaXN0KSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihpdGVtLCBqb2JLZXkpIHtcbiAgICAgIGlmICghKGl0ZW1bJ2VuZC10aW1lJ10gPiAtMSkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1bJ2VuZC10aW1lJ10gPSBpdGVtWydzdGFydC10aW1lJ10gKyBpdGVtWydkdXJhdGlvbiddO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICB0aGlzLnByb2Nlc3NWZXJ0aWNlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBhbmd1bGFyLmZvckVhY2goZGF0YS52ZXJ0aWNlcywgZnVuY3Rpb24odmVydGV4LCBpKSB7XG4gICAgICByZXR1cm4gdmVydGV4LnR5cGUgPSAncmVndWxhcic7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGEudmVydGljZXMudW5zaGlmdCh7XG4gICAgICBuYW1lOiAnU2NoZWR1bGVkJyxcbiAgICAgICdzdGFydC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ10sXG4gICAgICAnZW5kLXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXSArIDEsXG4gICAgICB0eXBlOiAnc2NoZWR1bGVkJ1xuICAgIH0pO1xuICB9O1xuICB0aGlzLmxpc3RKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JvdmVydmlld1wiKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihsaXN0LCBsaXN0S2V5KSB7XG4gICAgICAgICAgc3dpdGNoIChsaXN0S2V5KSB7XG4gICAgICAgICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgICAgICAgcmV0dXJuIGpvYnMucnVubmluZyA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgICAgY2FzZSAnZmluaXNoZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5maW5pc2hlZCA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgICAgICAgcmV0dXJuIGpvYnMuY2FuY2VsbGVkID0gX3RoaXMuc2V0RW5kVGltZXMobGlzdCk7XG4gICAgICAgICAgICBjYXNlICdmYWlsZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5mYWlsZWQgPSBfdGhpcy5zZXRFbmRUaW1lcyhsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYnMpO1xuICAgICAgICByZXR1cm4gbm90aWZ5T2JzZXJ2ZXJzKCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRKb2JzID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiBqb2JzW3R5cGVdO1xuICB9O1xuICB0aGlzLmdldEFsbEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gam9icztcbiAgfTtcbiAgdGhpcy5sb2FkSm9iID0gZnVuY3Rpb24oam9iaWQpIHtcbiAgICBjdXJyZW50Sm9iID0gbnVsbDtcbiAgICBkZWZlcnJlZHMuam9iID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgX3RoaXMuc2V0RW5kVGltZXMoZGF0YS52ZXJ0aWNlcyk7XG4gICAgICAgIF90aGlzLnByb2Nlc3NWZXJ0aWNlcyhkYXRhKTtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGpvYkNvbmZpZykge1xuICAgICAgICAgIGRhdGEgPSBhbmd1bGFyLmV4dGVuZChkYXRhLCBqb2JDb25maWcpO1xuICAgICAgICAgIGN1cnJlbnRKb2IgPSBkYXRhO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZHMuam9iLnJlc29sdmUoY3VycmVudEpvYik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkcy5qb2IucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXROb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgdmFyIGRlZmVycmVkLCBzZWVrTm9kZTtcbiAgICBzZWVrTm9kZSA9IGZ1bmN0aW9uKG5vZGVpZCwgZGF0YSkge1xuICAgICAgdmFyIGosIGxlbiwgbm9kZSwgc3ViO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBub2RlID0gZGF0YVtqXTtcbiAgICAgICAgaWYgKG5vZGUuaWQgPT09IG5vZGVpZCkge1xuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnN0ZXBfZnVuY3Rpb24pIHtcbiAgICAgICAgICBzdWIgPSBzZWVrTm9kZShub2RlaWQsIG5vZGUuc3RlcF9mdW5jdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIHJldHVybiBzdWI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGZvdW5kTm9kZTtcbiAgICAgICAgZm91bmROb2RlID0gc2Vla05vZGUobm9kZWlkLCBjdXJyZW50Sm9iLnBsYW4ubm9kZXMpO1xuICAgICAgICBmb3VuZE5vZGUudmVydGV4ID0gX3RoaXMuc2Vla1ZlcnRleChub2RlaWQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShmb3VuZE5vZGUpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuc2Vla1ZlcnRleCA9IGZ1bmN0aW9uKG5vZGVpZCkge1xuICAgIHZhciBqLCBsZW4sIHJlZiwgdmVydGV4O1xuICAgIHJlZiA9IGN1cnJlbnRKb2IudmVydGljZXM7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2ZXJ0ZXggPSByZWZbal07XG4gICAgICBpZiAodmVydGV4LmlkID09PSBub2RlaWQpIHtcbiAgICAgICAgcmV0dXJuIHZlcnRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIHRoaXMuZ2V0VmVydGV4ID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHZlcnRleDtcbiAgICAgICAgdmVydGV4ID0gX3RoaXMuc2Vla1ZlcnRleCh2ZXJ0ZXhpZCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3RpbWVzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZlcnRleC5zdWJ0YXNrcyA9IGRhdGEuc3VidGFza3M7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUodmVydGV4KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRTdWJ0YXNrcyA9IGZ1bmN0aW9uKHZlcnRleGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgc3VidGFza3M7XG4gICAgICAgICAgc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHN1YnRhc2tzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRUYXNrTWFuYWdlcnMgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL3Rhc2ttYW5hZ2Vyc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgdGFza21hbmFnZXJzO1xuICAgICAgICAgIHRhc2ttYW5hZ2VycyA9IGRhdGEudGFza21hbmFnZXJzO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHRhc2ttYW5hZ2Vycyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0QWNjdW11bGF0b3JzID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9hY2N1bXVsYXRvcnNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGFjY3VtdWxhdG9ycztcbiAgICAgICAgICBhY2N1bXVsYXRvcnMgPSBkYXRhWyd1c2VyLWFjY3VtdWxhdG9ycyddO1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3MvYWNjdW11bGF0b3JzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHN1YnRhc2tBY2N1bXVsYXRvcnM7XG4gICAgICAgICAgICBzdWJ0YXNrQWNjdW11bGF0b3JzID0gZGF0YS5zdWJ0YXNrcztcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgbWFpbjogYWNjdW11bGF0b3JzLFxuICAgICAgICAgICAgICBzdWJ0YXNrczogc3VidGFza0FjY3VtdWxhdG9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0Sm9iQ2hlY2twb2ludFN0YXRzID0gZnVuY3Rpb24oam9iaWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL2NoZWNrcG9pbnRzXCIpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHt9LCBkYXRhKSkge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRlZmVycmVkLnJlc29sdmUobnVsbCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IGZ1bmN0aW9uKHZlcnRleGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvY2hlY2twb2ludHNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIG9wZXJhdG9yU3RhdHMsIHN1YnRhc2tTdGF0cztcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIG9wZXJhdG9yU3RhdHM6IG51bGwsXG4gICAgICAgICAgICAgIHN1YnRhc2tzU3RhdHM6IG51bGxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcGVyYXRvclN0YXRzID0ge1xuICAgICAgICAgICAgICBpZDogZGF0YVsnaWQnXSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBkYXRhWyd0aW1lc3RhbXAnXSxcbiAgICAgICAgICAgICAgZHVyYXRpb246IGRhdGFbJ2R1cmF0aW9uJ10sXG4gICAgICAgICAgICAgIHNpemU6IGRhdGFbJ3NpemUnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YVsnc3VidGFza3MnXSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgICAgIG9wZXJhdG9yU3RhdHM6IG9wZXJhdG9yU3RhdHMsXG4gICAgICAgICAgICAgICAgc3VidGFza3NTdGF0czogbnVsbFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN1YnRhc2tTdGF0cyA9IGRhdGFbJ3N1YnRhc2tzJ107XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRvclN0YXRzOiBvcGVyYXRvclN0YXRzLFxuICAgICAgICAgICAgICAgIHN1YnRhc2tzU3RhdHM6IHN1YnRhc2tTdGF0c1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2JhY2twcmVzc3VyZVwiKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy50cmFuc2xhdGVCYWNrUHJlc3N1cmVMYWJlbFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2luLXByb2dyZXNzJzpcbiAgICAgICAgcmV0dXJuICdkYW5nZXInO1xuICAgICAgY2FzZSAnb2snOlxuICAgICAgICByZXR1cm4gJ3N1Y2Nlc3MnO1xuICAgICAgY2FzZSAnbG93JzpcbiAgICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICAgIGNhc2UgJ2hpZ2gnOlxuICAgICAgICByZXR1cm4gJ2Rhbmdlcic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5sb2FkRXhjZXB0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvZXhjZXB0aW9uc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGV4Y2VwdGlvbnMpIHtcbiAgICAgICAgICBjdXJyZW50Sm9iLmV4Y2VwdGlvbnMgPSBleGNlcHRpb25zO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGV4Y2VwdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmNhbmNlbEpvYiA9IGZ1bmN0aW9uKGpvYmlkKSB7XG4gICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3lhcm4tY2FuY2VsXCIpO1xuICB9O1xuICB0aGlzLnN0b3BKb2IgPSBmdW5jdGlvbihqb2JpZCkge1xuICAgIHJldHVybiAkaHR0cC5nZXQoXCJqb2JzL1wiICsgam9iaWQgKyBcIi95YXJuLXN0b3BcIik7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ21ldHJpY3NHcmFwaCcsIC0+XG4gIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHQgcGFuZWwtbWV0cmljXCI+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPnt7bXR5cGV9fVxuICAgICAgICAgICAgICAgICA8YSB0aXRsZT1cIlJlbW92ZVwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyBwdWxsLXJpZ2h0XCIgbmctY2xpY2s9XCJyZW1vdmVNZXRyaWMoKVwiPjxpIGNsYXNzPVwiZmEgZmEtY2xvc2VcIiAvPjwvYT5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAge3sgdmFsdWUgfX1cbiAgICAgICAgICAgICAgICAgPCEtLTxudmQzIG9wdGlvbnM9XCJvcHRpb25zXCIgZGF0YT1cImRhdGFcIj48L252ZDM+LS0+XG4gICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICA8L2Rpdj4nXG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6XG4gICAgbXR5cGU6IFwiQFwiXG4gICAgb3B0aW9uczogXCI9XCJcbiAgICBkYXRhOiBcIj1cIlxuICAgIHJlbW92ZU1ldHJpYzogXCImXCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLnZhbHVlID0gbnVsbFxuXG4gICAgc2NvcGUucmVtb3ZlID0gLT5cbiAgICAgIGNvbnNvbGUubG9nICdoZXJlJ1xuICAgICAgc2NvcGUuJGRlc3Ryb3koKVxuXG4gICAgc2NvcGUuJG9uICdtZXRyaWNzOmRhdGE6dXBkYXRlJywgKGV2ZW50LCBkYXRhKSAtPlxuICAgICAgc2NvcGUudmFsdWUgPSBkYXRhW3Njb3BlLm10eXBlXVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuZGlyZWN0aXZlKCdtZXRyaWNzR3JhcGgnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0IHBhbmVsLW1ldHJpY1wiPiA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPnt7bXR5cGV9fSA8YSB0aXRsZT1cIlJlbW92ZVwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyBwdWxsLXJpZ2h0XCIgbmctY2xpY2s9XCJyZW1vdmVNZXRyaWMoKVwiPjxpIGNsYXNzPVwiZmEgZmEtY2xvc2VcIiAvPjwvYT4gPC9kaXY+IDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+IHt7IHZhbHVlIH19IDwhLS08bnZkMyBvcHRpb25zPVwib3B0aW9uc1wiIGRhdGE9XCJkYXRhXCI+PC9udmQzPi0tPiA8L2Rpdj4gPC9kaXY+JyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBtdHlwZTogXCJAXCIsXG4gICAgICBvcHRpb25zOiBcIj1cIixcbiAgICAgIGRhdGE6IFwiPVwiLFxuICAgICAgcmVtb3ZlTWV0cmljOiBcIiZcIlxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS52YWx1ZSA9IG51bGw7XG4gICAgICBzY29wZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hlcmUnKTtcbiAgICAgICAgcmV0dXJuIHNjb3BlLiRkZXN0cm95KCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHNjb3BlLiRvbignbWV0cmljczpkYXRhOnVwZGF0ZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBzY29wZS52YWx1ZSA9IGRhdGFbc2NvcGUubXR5cGVdO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLnNlcnZpY2UgJ01ldHJpY3NTZXJ2aWNlJywgKCRodHRwLCAkcSwgZmxpbmtDb25maWcpIC0+XG4gICMgIEBtZXRyaWNzID0gWyBcImVsZW1lbnRzLWluXCIsIFwiZWxlbWVudHMtb3V0XCIsIFwiYnl0ZXMtaW5cIiwgXCJieXRlcy1vdXRcIiBdXG4gIEBtZXRyaWNzID0ge31cblxuICBAc2V0dXBMUyA9IC0+XG4gICAgaWYgIWxvY2FsU3RvcmFnZS5mbGlua01ldHJpY3M/XG4gICAgICBAc2F2ZVRvTFMoKVxuXG4gICAgQG1ldHJpY3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5mbGlua01ldHJpY3MpXG5cbiAgQHNhdmVUb0xTID0gLT5cbiAgICBsb2NhbFN0b3JhZ2UuZmxpbmtNZXRyaWNzID0gSlNPTi5zdHJpbmdpZnkoQG1ldHJpY3MpXG5cbiAgQHNldHVwTFNGb3IgPSAoam9iaWQsIG5vZGVpZCkgLT5cbiAgICBpZiAhQG1ldHJpY3Nbam9iaWRdP1xuICAgICAgQG1ldHJpY3Nbam9iaWRdID0ge31cblxuICAgIGlmICFAbWV0cmljc1tqb2JpZF1bbm9kZWlkXT9cbiAgICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdID0gW11cblxuICBAYWRkTWV0cmljID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSAtPlxuICAgIEBzZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpXG5cbiAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5wdXNoKG1ldHJpY2lkKVxuXG4gICAgQHNhdmVUb0xTKClcblxuICBAcmVtb3ZlTWV0cmljID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSA9PlxuICAgIGlmIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdP1xuICAgICAgaSA9IEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljaWQpXG4gICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaSwgMSkgaWYgaSAhPSAtMVxuXG4gICAgICBAc2F2ZVRvTFMoKVxuXG4gIEBnZXRNZXRyaWNzU2V0dXAgPSAoam9iaWQsIG5vZGVpZCkgPT5cbiAgICBsaXN0OiBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXVxuXG4gIEBnZXRBdmFpbGFibGVNZXRyaWNzID0gKGpvYmlkLCBub2RlaWQpID0+XG4gICAgQHNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZClcblxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvdmVydGljZXMvXCIgKyBub2RlaWQgKyBcIi9tZXRyaWNzXCJcbiAgICAuc3VjY2VzcyAoZGF0YSkgPT5cbiAgICAgIHJlc3VsdHMgPSBbXVxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEuYXZhaWxhYmxlLCAodiwgaykgPT5cbiAgICAgICAgaWYgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZih2LmlkKSA9PSAtMVxuICAgICAgICAgIHJlc3VsdHMucHVzaCh2KVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldE1ldHJpY3MgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljSWRzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgaWRzID0gbWV0cmljSWRzLmpvaW4oXCIsXCIpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3M/Z2V0PVwiICsgaWRzXG4gICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICByZXN1bHQgPSB7fVxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEsICh2LCBrKSAtPlxuICAgICAgICByZXN1bHRbdi5pZF0gPSB2LnZhbHVlXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQHNldHVwTFMoKVxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ01ldHJpY3NTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsICRxLCBmbGlua0NvbmZpZykge1xuICB0aGlzLm1ldHJpY3MgPSB7fTtcbiAgdGhpcy5zZXR1cExTID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5mbGlua01ldHJpY3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5zYXZlVG9MUygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZmxpbmtNZXRyaWNzKTtcbiAgfTtcbiAgdGhpcy5zYXZlVG9MUyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZmxpbmtNZXRyaWNzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5tZXRyaWNzKTtcbiAgfTtcbiAgdGhpcy5zZXR1cExTRm9yID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCkge1xuICAgIGlmICh0aGlzLm1ldHJpY3Nbam9iaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMubWV0cmljc1tqb2JpZF0gPSB7fTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdID0gW107XG4gICAgfVxuICB9O1xuICB0aGlzLmFkZE1ldHJpYyA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSB7XG4gICAgdGhpcy5zZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpO1xuICAgIHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5wdXNoKG1ldHJpY2lkKTtcbiAgICByZXR1cm4gdGhpcy5zYXZlVG9MUygpO1xuICB9O1xuICB0aGlzLnJlbW92ZU1ldHJpYyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBtZXRyaWNpZCkge1xuICAgICAgdmFyIGk7XG4gICAgICBpZiAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSAhPSBudWxsKSB7XG4gICAgICAgIGkgPSBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljaWQpO1xuICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuc2F2ZVRvTFMoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRNZXRyaWNzU2V0dXAgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGlzdDogX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXVxuICAgICAgfTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRBdmFpbGFibGVNZXRyaWNzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIF90aGlzLnNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZCk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3NcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLmF2YWlsYWJsZSwgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgIGlmIChfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2Yodi5pZCkgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5wdXNoKHYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRNZXRyaWNzID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgbWV0cmljSWRzKSB7XG4gICAgdmFyIGRlZmVycmVkLCBpZHM7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGlkcyA9IG1ldHJpY0lkcy5qb2luKFwiLFwiKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3M/Z2V0PVwiICsgaWRzKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICByZXN1bHQgPSB7fTtcbiAgICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odiwgaykge1xuICAgICAgICByZXN1bHRbdi5pZF0gPSB2LnZhbHVlO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuc2V0dXBMUygpO1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdPdmVydmlld0NvbnRyb2xsZXInLCAoJHNjb3BlLCBPdmVydmlld1NlcnZpY2UsIEpvYnNTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSAtPlxuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSAtPlxuICAgICRzY29wZS5ydW5uaW5nSm9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKVxuICAgICRzY29wZS5maW5pc2hlZEpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpXG5cbiAgSm9ic1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICBKb2JzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuXG4gICRzY29wZS5qb2JPYnNlcnZlcigpXG5cbiAgT3ZlcnZpZXdTZXJ2aWNlLmxvYWRPdmVydmlldygpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YVxuXG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICBPdmVydmlld1NlcnZpY2UubG9hZE92ZXJ2aWV3KCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5vdmVydmlldyA9IGRhdGFcbiAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgJGludGVydmFsLmNhbmNlbChyZWZyZXNoKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignT3ZlcnZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBPdmVydmlld1NlcnZpY2UsIEpvYnNTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gIHZhciByZWZyZXNoO1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucnVubmluZ0pvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdydW5uaW5nJyk7XG4gICAgcmV0dXJuICRzY29wZS5maW5pc2hlZEpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpO1xuICB9O1xuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICB9KTtcbiAgJHNjb3BlLmpvYk9ic2VydmVyKCk7XG4gIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUub3ZlcnZpZXcgPSBkYXRhO1xuICAgIH0pO1xuICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICByZXR1cm4gJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnT3ZlcnZpZXdTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIG92ZXJ2aWV3ID0ge31cblxuICBAbG9hZE92ZXJ2aWV3ID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcIm92ZXJ2aWV3XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgb3ZlcnZpZXcgPSBkYXRhXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnT3ZlcnZpZXdTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgb3ZlcnZpZXc7XG4gIG92ZXJ2aWV3ID0ge307XG4gIHRoaXMubG9hZE92ZXJ2aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJvdmVydmlld1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBvdmVydmlldyA9IGRhdGE7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uY29udHJvbGxlciAnSm9iU3VibWl0Q29udHJvbGxlcicsICgkc2NvcGUsIEpvYlN1Ym1pdFNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcsICRzdGF0ZSwgJGxvY2F0aW9uKSAtPlxuICAkc2NvcGUueWFybiA9ICRsb2NhdGlvbi5hYnNVcmwoKS5pbmRleE9mKFwiL3Byb3h5L2FwcGxpY2F0aW9uX1wiKSAhPSAtMVxuICAkc2NvcGUubG9hZExpc3QgPSAoKSAtPlxuICAgIEpvYlN1Ym1pdFNlcnZpY2UubG9hZEphckxpc3QoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmFkZHJlc3MgPSBkYXRhLmFkZHJlc3NcbiAgICAgICRzY29wZS5ub2FjY2VzcyA9IGRhdGEuZXJyb3JcbiAgICAgICRzY29wZS5qYXJzID0gZGF0YS5maWxlc1xuXG4gICRzY29wZS5kZWZhdWx0U3RhdGUgPSAoKSAtPlxuICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICRzY29wZS5lcnJvciA9IG51bGxcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZDogbnVsbCxcbiAgICAgIHBhcmFsbGVsaXNtOiBcIlwiLFxuICAgICAgJ2VudHJ5LWNsYXNzJzogXCJcIixcbiAgICAgICdwcm9ncmFtLWFyZ3MnOiBcIlwiLFxuICAgICAgJ3BsYW4tYnV0dG9uJzogXCJTaG93IFBsYW5cIixcbiAgICAgICdzdWJtaXQtYnV0dG9uJzogXCJTdWJtaXRcIixcbiAgICAgICdhY3Rpb24tdGltZSc6IDBcbiAgICB9XG5cbiAgJHNjb3BlLmRlZmF1bHRTdGF0ZSgpXG4gICRzY29wZS51cGxvYWRlciA9IHt9XG4gICRzY29wZS5sb2FkTGlzdCgpXG5cbiAgcmVmcmVzaCA9ICRpbnRlcnZhbCAtPlxuICAgICRzY29wZS5sb2FkTGlzdCgpXG4gICwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdXG5cbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaClcblxuICAkc2NvcGUuc2VsZWN0SmFyID0gKGlkKSAtPlxuICAgIGlmICRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9PSBpZFxuICAgICAgJHNjb3BlLmRlZmF1bHRTdGF0ZSgpXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLmRlZmF1bHRTdGF0ZSgpXG4gICAgICAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPSBpZFxuXG4gICRzY29wZS5kZWxldGVKYXIgPSAoZXZlbnQsIGlkKSAtPlxuICAgIGlmICRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9PSBpZFxuICAgICAgJHNjb3BlLmRlZmF1bHRTdGF0ZSgpXG4gICAgYW5ndWxhci5lbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiZmEtcmVtb3ZlXCIpLmFkZENsYXNzKFwiZmEtc3BpbiBmYS1zcGlubmVyXCIpXG4gICAgSm9iU3VibWl0U2VydmljZS5kZWxldGVKYXIoaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXNwaW5uZXJcIikuYWRkQ2xhc3MoXCJmYS1yZW1vdmVcIilcbiAgICAgIGlmIGRhdGEuZXJyb3I/XG4gICAgICAgIGFsZXJ0KGRhdGEuZXJyb3IpXG5cbiAgJHNjb3BlLmxvYWRFbnRyeUNsYXNzID0gKG5hbWUpIC0+XG4gICAgJHNjb3BlLnN0YXRlWydlbnRyeS1jbGFzcyddID0gbmFtZVxuXG4gICRzY29wZS5nZXRQbGFuID0gKCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPT0gXCJTaG93IFBsYW5cIlxuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICAgICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXSA9IGFjdGlvblxuICAgICAgJHNjb3BlLnN0YXRlWydzdWJtaXQtYnV0dG9uJ10gPSBcIlN1Ym1pdFwiXG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIkdldHRpbmcgUGxhblwiXG4gICAgICAkc2NvcGUuZXJyb3IgPSBudWxsXG4gICAgICAkc2NvcGUucGxhbiA9IG51bGxcbiAgICAgIEpvYlN1Ym1pdFNlcnZpY2UuZ2V0UGxhbihcbiAgICAgICAgJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICAgJ2VudHJ5LWNsYXNzJzogJHNjb3BlLnN0YXRlWydlbnRyeS1jbGFzcyddLFxuICAgICAgICAgIHBhcmFsbGVsaXNtOiAkc2NvcGUuc3RhdGUucGFyYWxsZWxpc20sXG4gICAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ11cbiAgICAgICAgfVxuICAgICAgKS50aGVuIChkYXRhKSAtPlxuICAgICAgICBpZiBhY3Rpb24gPT0gJHNjb3BlLnN0YXRlWydhY3Rpb24tdGltZSddXG4gICAgICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJTaG93IFBsYW5cIlxuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3JcbiAgICAgICAgICAkc2NvcGUucGxhbiA9IGRhdGEucGxhblxuXG4gICRzY29wZS5ydW5Kb2IgPSAoKSAtPlxuICAgIGlmICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID09IFwiU3VibWl0XCJcbiAgICAgIGFjdGlvbiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb25cbiAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXR0aW5nXCJcbiAgICAgICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9IFwiU2hvdyBQbGFuXCJcbiAgICAgICRzY29wZS5lcnJvciA9IG51bGxcbiAgICAgIEpvYlN1Ym1pdFNlcnZpY2UucnVuSm9iKFxuICAgICAgICAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQsIHtcbiAgICAgICAgICAnZW50cnktY2xhc3MnOiAkc2NvcGUuc3RhdGVbJ2VudHJ5LWNsYXNzJ10sXG4gICAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgICAncHJvZ3JhbS1hcmdzJzogJHNjb3BlLnN0YXRlWydwcm9ncmFtLWFyZ3MnXVxuICAgICAgICB9XG4gICAgICApLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgIGlmIGFjdGlvbiA9PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ11cbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCJcbiAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBkYXRhLmVycm9yXG4gICAgICAgICAgaWYgZGF0YS5qb2JpZD9cbiAgICAgICAgICAgICRzdGF0ZS5nbyhcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiLCB7am9iaWQ6IGRhdGEuam9iaWR9KVxuXG4gICMgam9iIHBsYW4gZGlzcGxheSByZWxhdGVkIHN0dWZmXG4gICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICRzY29wZS5jaGFuZ2VOb2RlID0gKG5vZGVpZCkgLT5cbiAgICBpZiBub2RlaWQgIT0gJHNjb3BlLm5vZGVpZFxuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZFxuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGxcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGxcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsXG5cbiAgICAgICRzY29wZS4kYnJvYWRjYXN0ICdyZWxvYWQnXG5cbiAgICBlbHNlXG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbFxuICAgICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlXG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcblxuICAkc2NvcGUuY2xlYXJGaWxlcyA9ICgpIC0+XG4gICAgJHNjb3BlLnVwbG9hZGVyID0ge31cblxuICAkc2NvcGUudXBsb2FkRmlsZXMgPSAoZmlsZXMpIC0+XG4gICAgIyBtYWtlIHN1cmUgZXZlcnl0aGluZyBpcyBjbGVhciBhZ2Fpbi5cbiAgICAkc2NvcGUudXBsb2FkZXIgPSB7fVxuICAgIGlmIGZpbGVzLmxlbmd0aCA9PSAxXG4gICAgICAkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXSA9IGZpbGVzWzBdXG4gICAgICAkc2NvcGUudXBsb2FkZXJbJ3VwbG9hZCddID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgICRzY29wZS51cGxvYWRlclsnZXJyb3InXSA9IFwiRGlkIHlhIGZvcmdldCB0byBzZWxlY3QgYSBmaWxlP1wiXG5cbiAgJHNjb3BlLnN0YXJ0VXBsb2FkID0gKCkgLT5cbiAgICBpZiAkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXT9cbiAgICAgIGZvcm1kYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICAgIGZvcm1kYXRhLmFwcGVuZChcImphcmZpbGVcIiwgJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10pXG4gICAgICAkc2NvcGUudXBsb2FkZXJbJ3VwbG9hZCddID0gZmFsc2VcbiAgICAgICRzY29wZS51cGxvYWRlclsnc3VjY2VzcyddID0gXCJJbml0aWFsaXppbmcgdXBsb2FkLi4uXCJcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSAoZXZlbnQpIC0+XG4gICAgICAgICRzY29wZS51cGxvYWRlclsnc3VjY2VzcyddID0gbnVsbFxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3Byb2dyZXNzJ10gPSBwYXJzZUludCgxMDAgKiBldmVudC5sb2FkZWQgLyBldmVudC50b3RhbClcbiAgICAgIHhoci51cGxvYWQub25lcnJvciA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gbnVsbFxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHVwbG9hZGluZyB5b3VyIGZpbGVcIlxuICAgICAgeGhyLnVwbG9hZC5vbmxvYWQgPSAoZXZlbnQpIC0+XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGxcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlNhdmluZy4uLlwiXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgLT5cbiAgICAgICAgaWYgeGhyLnJlYWR5U3RhdGUgPT0gNFxuICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgIGlmIHJlc3BvbnNlLmVycm9yP1xuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gcmVzcG9uc2UuZXJyb3JcbiAgICAgICAgICAgICRzY29wZS51cGxvYWRlclsnc3VjY2VzcyddID0gbnVsbFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICRzY29wZS51cGxvYWRlclsnc3VjY2VzcyddID0gXCJVcGxvYWRlZCFcIlxuICAgICAgeGhyLm9wZW4oXCJQT1NUXCIsIFwiL2phcnMvdXBsb2FkXCIpXG4gICAgICB4aHIuc2VuZChmb3JtZGF0YSlcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyhcIlVuZXhwZWN0ZWQgRXJyb3IuIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW5cIilcblxuLmZpbHRlciAnZ2V0SmFyU2VsZWN0Q2xhc3MnLCAtPlxuICAoc2VsZWN0ZWQsIGFjdHVhbCkgLT5cbiAgICBpZiBzZWxlY3RlZCA9PSBhY3R1YWxcbiAgICAgIFwiZmEtY2hlY2stc3F1YXJlXCJcbiAgICBlbHNlXG4gICAgICBcImZhLXNxdWFyZS1vXCJcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmNvbnRyb2xsZXIoJ0pvYlN1Ym1pdENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYlN1Ym1pdFNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcsICRzdGF0ZSwgJGxvY2F0aW9uKSB7XG4gIHZhciByZWZyZXNoO1xuICAkc2NvcGUueWFybiA9ICRsb2NhdGlvbi5hYnNVcmwoKS5pbmRleE9mKFwiL3Byb3h5L2FwcGxpY2F0aW9uX1wiKSAhPT0gLTE7XG4gICRzY29wZS5sb2FkTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmxvYWRKYXJMaXN0KCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuYWRkcmVzcyA9IGRhdGEuYWRkcmVzcztcbiAgICAgICRzY29wZS5ub2FjY2VzcyA9IGRhdGEuZXJyb3I7XG4gICAgICByZXR1cm4gJHNjb3BlLmphcnMgPSBkYXRhLmZpbGVzO1xuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuZGVmYXVsdFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBsYW4gPSBudWxsO1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgcmV0dXJuICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGVkOiBudWxsLFxuICAgICAgcGFyYWxsZWxpc206IFwiXCIsXG4gICAgICAnZW50cnktY2xhc3MnOiBcIlwiLFxuICAgICAgJ3Byb2dyYW0tYXJncyc6IFwiXCIsXG4gICAgICAncGxhbi1idXR0b24nOiBcIlNob3cgUGxhblwiLFxuICAgICAgJ3N1Ym1pdC1idXR0b24nOiBcIlN1Ym1pdFwiLFxuICAgICAgJ2FjdGlvbi10aW1lJzogMFxuICAgIH07XG4gIH07XG4gICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgJHNjb3BlLnVwbG9hZGVyID0ge307XG4gICRzY29wZS5sb2FkTGlzdCgpO1xuICByZWZyZXNoID0gJGludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUubG9hZExpc3QoKTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG4gICRzY29wZS5zZWxlY3RKYXIgPSBmdW5jdGlvbihpZCkge1xuICAgIGlmICgkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT09IGlkKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLmRlZmF1bHRTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUuZGVmYXVsdFN0YXRlKCk7XG4gICAgICByZXR1cm4gJHNjb3BlLnN0YXRlLnNlbGVjdGVkID0gaWQ7XG4gICAgfVxuICB9O1xuICAkc2NvcGUuZGVsZXRlSmFyID0gZnVuY3Rpb24oZXZlbnQsIGlkKSB7XG4gICAgaWYgKCRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9PT0gaWQpIHtcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgICB9XG4gICAgYW5ndWxhci5lbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiZmEtcmVtb3ZlXCIpLmFkZENsYXNzKFwiZmEtc3BpbiBmYS1zcGlubmVyXCIpO1xuICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmRlbGV0ZUphcihpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXNwaW5uZXJcIikuYWRkQ2xhc3MoXCJmYS1yZW1vdmVcIik7XG4gICAgICBpZiAoZGF0YS5lcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhbGVydChkYXRhLmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmxvYWRFbnRyeUNsYXNzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiAkc2NvcGUuc3RhdGVbJ2VudHJ5LWNsYXNzJ10gPSBuYW1lO1xuICB9O1xuICAkc2NvcGUuZ2V0UGxhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3Rpb247XG4gICAgaWYgKCRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9PT0gXCJTaG93IFBsYW5cIikge1xuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb247XG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCI7XG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIkdldHRpbmcgUGxhblwiO1xuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICRzY29wZS5wbGFuID0gbnVsbDtcbiAgICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmdldFBsYW4oJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ11cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoYWN0aW9uID09PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10pIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiO1xuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3I7XG4gICAgICAgICAgcmV0dXJuICRzY29wZS5wbGFuID0gZGF0YS5wbGFuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5ydW5Kb2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0aW9uO1xuICAgIGlmICgkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9PT0gXCJTdWJtaXRcIikge1xuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb247XG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0dGluZ1wiO1xuICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJTaG93IFBsYW5cIjtcbiAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgICByZXR1cm4gSm9iU3VibWl0U2VydmljZS5ydW5Kb2IoJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ11cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoYWN0aW9uID09PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10pIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCI7XG4gICAgICAgICAgJHNjb3BlLmVycm9yID0gZGF0YS5lcnJvcjtcbiAgICAgICAgICBpZiAoZGF0YS5qb2JpZCAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJHN0YXRlLmdvKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtcbiAgICAgICAgICAgICAgam9iaWQ6IGRhdGEuam9iaWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICBpZiAobm9kZWlkICE9PSAkc2NvcGUubm9kZWlkKSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkO1xuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGw7XG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsO1xuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgICByZXR1cm4gJHNjb3BlLiRicm9hZGNhc3QoJ3JlbG9hZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZTtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICB9XG4gIH07XG4gICRzY29wZS5jbGVhckZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS51cGxvYWRlciA9IHt9O1xuICB9O1xuICAkc2NvcGUudXBsb2FkRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICRzY29wZS51cGxvYWRlciA9IHt9O1xuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICRzY29wZS51cGxvYWRlclsnZmlsZSddID0gZmlsZXNbMF07XG4gICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWyd1cGxvYWQnXSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkRpZCB5YSBmb3JnZXQgdG8gc2VsZWN0IGEgZmlsZT9cIjtcbiAgICB9XG4gIH07XG4gIHJldHVybiAkc2NvcGUuc3RhcnRVcGxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWRhdGEsIHhocjtcbiAgICBpZiAoJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10gIT0gbnVsbCkge1xuICAgICAgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZvcm1kYXRhLmFwcGVuZChcImphcmZpbGVcIiwgJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10pO1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWyd1cGxvYWQnXSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIkluaXRpYWxpemluZyB1cGxvYWQuLi5cIjtcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsO1xuICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gcGFyc2VJbnQoMTAwICogZXZlbnQubG9hZGVkIC8gZXZlbnQudG90YWwpO1xuICAgICAgfTtcbiAgICAgIHhoci51cGxvYWQub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHVwbG9hZGluZyB5b3VyIGZpbGVcIjtcbiAgICAgIH07XG4gICAgICB4aHIudXBsb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiU2F2aW5nLi4uXCI7XG4gICAgICB9O1xuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gcmVzcG9uc2UuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlVwbG9hZGVkIVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHhoci5vcGVuKFwiUE9TVFwiLCBcIi9qYXJzL3VwbG9hZFwiKTtcbiAgICAgIHJldHVybiB4aHIuc2VuZChmb3JtZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIlVuZXhwZWN0ZWQgRXJyb3IuIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW5cIik7XG4gICAgfVxuICB9O1xufSkuZmlsdGVyKCdnZXRKYXJTZWxlY3RDbGFzcycsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24oc2VsZWN0ZWQsIGFjdHVhbCkge1xuICAgIGlmIChzZWxlY3RlZCA9PT0gYWN0dWFsKSB7XG4gICAgICByZXR1cm4gXCJmYS1jaGVjay1zcXVhcmVcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiZmEtc3F1YXJlLW9cIjtcbiAgICB9XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnSm9iU3VibWl0U2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuXG4gIEBsb2FkSmFyTGlzdCA9ICgpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoXCJqYXJzL1wiKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZGVsZXRlSmFyID0gKGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZGVsZXRlKFwiamFycy9cIiArIGlkKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldFBsYW4gPSAoaWQsIGFyZ3MpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoXCJqYXJzL1wiICsgaWQgKyBcIi9wbGFuXCIsIHtwYXJhbXM6IGFyZ3N9KVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAcnVuSm9iID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAucG9zdChcImphcnMvXCIgKyBpZCArIFwiL3J1blwiLCB7fSwge3BhcmFtczogYXJnc30pXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ0pvYlN1Ym1pdFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgZmxpbmtDb25maWcsICRxKSB7XG4gIHRoaXMubG9hZEphckxpc3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChcImphcnMvXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmRlbGV0ZUphciA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cFtcImRlbGV0ZVwiXShcImphcnMvXCIgKyBpZCkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0UGxhbiA9IGZ1bmN0aW9uKGlkLCBhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoXCJqYXJzL1wiICsgaWQgKyBcIi9wbGFuXCIsIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLnJ1bkpvYiA9IGZ1bmN0aW9uKGlkLCBhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5wb3N0KFwiamFycy9cIiArIGlkICsgXCIvcnVuXCIsIHt9LCB7XG4gICAgICBwYXJhbXM6IGFyZ3NcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uY29udHJvbGxlciAnQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcicsICgkc2NvcGUsIFRhc2tNYW5hZ2Vyc1NlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIC0+XG4gIFRhc2tNYW5hZ2Vyc1NlcnZpY2UubG9hZE1hbmFnZXJzKCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUubWFuYWdlcnMgPSBkYXRhXG5cbiAgcmVmcmVzaCA9ICRpbnRlcnZhbCAtPlxuICAgIFRhc2tNYW5hZ2Vyc1NlcnZpY2UubG9hZE1hbmFnZXJzKCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5tYW5hZ2VycyA9IGRhdGFcbiAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgJGludGVydmFsLmNhbmNlbChyZWZyZXNoKVxuXG4uY29udHJvbGxlciAnU2luZ2xlVGFza01hbmFnZXJDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIC0+XG4gICRzY29wZS5tZXRyaWNzID0ge31cbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdXG5cbiAgICByZWZyZXNoID0gJGludGVydmFsIC0+XG4gICAgICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZE1ldHJpY3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS5tZXRyaWNzID0gZGF0YVswXVxuICAgICwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdXG5cbiAgICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlckxvZ3NDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIC0+XG4gICRzY29wZS5sb2cgPSB7fVxuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZExvZ3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLmxvZyA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmxvZyA9IGRhdGFcblxuICAkc2NvcGUuZG93bmxvYWREYXRhID0gKCkgLT5cbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL3Rhc2ttYW5hZ2Vycy9cIiArICgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkgKyBcIi9sb2dcIlxuXG4uY29udHJvbGxlciAnU2luZ2xlVGFza01hbmFnZXJTdGRvdXRDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIC0+XG4gICRzY29wZS5zdGRvdXQgPSB7fVxuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZFN0ZG91dCgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUuc3Rkb3V0ID0gZGF0YVxuXG4gICRzY29wZS5yZWxvYWREYXRhID0gKCkgLT5cbiAgICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZFN0ZG91dCgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5zdGRvdXQgPSBkYXRhXG5cbiAgJHNjb3BlLmRvd25sb2FkRGF0YSA9ICgpIC0+XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi90YXNrbWFuYWdlcnMvXCIgKyAoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpICsgXCIvc3Rkb3V0XCJcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmNvbnRyb2xsZXIoJ0FsbFRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIFRhc2tNYW5hZ2Vyc1NlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIHtcbiAgdmFyIHJlZnJlc2g7XG4gIFRhc2tNYW5hZ2Vyc1NlcnZpY2UubG9hZE1hbmFnZXJzKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICRzY29wZS5tYW5hZ2VycyA9IGRhdGE7XG4gIH0pO1xuICByZWZyZXNoID0gJGludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBUYXNrTWFuYWdlcnNTZXJ2aWNlLmxvYWRNYW5hZ2VycygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5tYW5hZ2VycyA9IGRhdGE7XG4gICAgfSk7XG4gIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZVRhc2tNYW5hZ2VyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIHtcbiAgdmFyIHJlZnJlc2g7XG4gICRzY29wZS5tZXRyaWNzID0ge307XG4gIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTWV0cmljcygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICRzY29wZS5tZXRyaWNzID0gZGF0YVswXTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTWV0cmljcygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdO1xuICAgIH0pO1xuICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICByZXR1cm4gJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG59KS5jb250cm9sbGVyKCdTaW5nbGVUYXNrTWFuYWdlckxvZ3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICAkc2NvcGUubG9nID0ge307XG4gIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTG9ncygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICRzY29wZS5sb2cgPSBkYXRhO1xuICB9KTtcbiAgJHNjb3BlLnJlbG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUubG9nID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS5kb3dubG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi90YXNrbWFuYWdlcnMvXCIgKyAkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCArIFwiL2xvZ1wiO1xuICB9O1xufSkuY29udHJvbGxlcignU2luZ2xlVGFza01hbmFnZXJTdGRvdXRDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICAkc2NvcGUuc3Rkb3V0ID0ge307XG4gIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkU3Rkb3V0KCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLnN0ZG91dCA9IGRhdGE7XG4gIH0pO1xuICAkc2NvcGUucmVsb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZFN0ZG91dCgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLnN0ZG91dCA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiAkc2NvcGUuZG93bmxvYWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvdGFza21hbmFnZXJzL1wiICsgJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQgKyBcIi9zdGRvdXRcIjtcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdUYXNrTWFuYWdlcnNTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIEBsb2FkTWFuYWdlcnMgPSAoKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgQGxvYWRNZXRyaWNzID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvbWV0cmljc1wiKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YVsndGFza21hbmFnZXJzJ10pXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGxvYWRMb2dzID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvbG9nXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBsb2FkU3Rkb3V0ID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvc3Rkb3V0XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnVGFza01hbmFnZXJzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkTWFuYWdlcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcInRhc2ttYW5hZ2Vyc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB0aGlzLmxvYWRNZXRyaWNzID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL21ldHJpY3NcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YVsndGFza21hbmFnZXJzJ10pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmxvYWRMb2dzID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL2xvZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5sb2FkU3Rkb3V0ID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL3N0ZG91dFwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

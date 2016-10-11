angular.module('flinkApp', ['ui.router', 'angularMoment', 'dndLists']).run(["$rootScope", function($rootScope) {
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
}]).controller('SingleJobController', ["$scope", "$state", "$stateParams", "JobsService", "MetricsService", "$rootScope", "flinkConfig", "$interval", function($scope, $state, $stateParams, JobsService, MetricsService, $rootScope, flinkConfig, $interval) {
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
    $scope.vertices = data.vertices;
    return MetricsService.setupMetrics($stateParams.jobid, data.vertices);
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
      $scope.$broadcast('reload');
      return $scope.$broadcast('node:change', $scope.nodeid);
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
  var loadMetrics;
  console.log('JobPlanMetricsController');
  $scope.dragging = false;
  $scope.window = MetricsService.getWindow();
  $scope.availableMetrics = null;
  $scope.$on('$destroy', function() {
    return MetricsService.unRegisterObserver();
  });
  loadMetrics = function() {
    JobsService.getVertex($scope.nodeid).then(function(data) {
      return $scope.vertex = data;
    });
    return MetricsService.getAvailableMetrics($scope.jobid, $scope.nodeid).then(function(data) {
      $scope.availableMetrics = data;
      $scope.metrics = MetricsService.getMetricsSetup($scope.jobid, $scope.nodeid).names;
      return MetricsService.registerObserver($scope.jobid, $scope.nodeid, function(data) {
        return $scope.$broadcast("metrics:data:update", data.timestamp, data.values);
      });
    });
  };
  $scope.dropped = function(event, index, item, external, type) {
    MetricsService.orderMetrics($scope.jobid, $scope.nodeid, item, index);
    $scope.$broadcast("metrics:refresh", item);
    loadMetrics();
    return false;
  };
  $scope.dragStart = function() {
    return $scope.dragging = true;
  };
  $scope.dragEnd = function() {
    return $scope.dragging = false;
  };
  $scope.addMetric = function(metric) {
    MetricsService.addMetric($scope.jobid, $scope.nodeid, metric.id);
    return loadMetrics();
  };
  $scope.removeMetric = function(metric) {
    MetricsService.removeMetric($scope.jobid, $scope.nodeid, metric);
    return loadMetrics();
  };
  $scope.setMetricSize = function(metric, size) {
    MetricsService.setMetricSize($scope.jobid, $scope.nodeid, metric, size);
    return loadMetrics();
  };
  $scope.getValues = function(metric) {
    return MetricsService.getValues($scope.jobid, $scope.nodeid, metric);
  };
  $scope.$on('node:change', function(event, nodeid) {
    if (!$scope.dragging) {
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
    template: '<div class="panel panel-default panel-metric"> <div class="panel-heading"> {{metric.id}} <div class="buttons"> <div class="btn-group"> <button type="button" ng-class="[btnClasses, {active: metric.size != \'big\'}]" ng-click="setSize(\'small\')">Small</button> <button type="button" ng-class="[btnClasses, {active: metric.size == \'big\'}]" ng-click="setSize(\'big\')">Big</button> </div> <a title="Remove" class="btn btn-default btn-xs remove" ng-click="removeMetric()"><i class="fa fa-close" /></a> </div> </div> <div class="panel-body"> <svg /> </div> </div>',
    replace: true,
    scope: {
      metric: "=",
      window: "=",
      removeMetric: "&",
      setMetricSize: "=",
      getValues: "&"
    },
    link: function(scope, element, attrs) {
      scope.btnClasses = ['btn', 'btn-default', 'btn-xs'];
      scope.value = null;
      scope.data = [
        {
          values: scope.getValues()
        }
      ];
      scope.options = {
        x: function(d, i) {
          return d.x;
        },
        y: function(d, i) {
          return d.y;
        },
        xTickFormat: function(d) {
          return d3.time.format('%H:%M:%S')(new Date(d));
        },
        yTickFormat: function(d) {
          if (d >= 1000000) {
            return (d / 1000000) + "m";
          } else if (d >= 1000) {
            return (d / 1000) + "k";
          } else {
            return d;
          }
        }
      };
      scope.showChart = function() {
        return d3.select(element.find("svg")[0]).datum(scope.data).transition().duration(250).call(scope.chart);
      };
      scope.chart = nv.models.lineChart().options(scope.options).showLegend(false).margin({
        top: 15,
        left: 50,
        bottom: 30,
        right: 30
      });
      scope.chart.yAxis.showMaxMin(false);
      scope.chart.tooltip.hideDelay(0);
      scope.chart.tooltip.contentGenerator(function(obj) {
        return "<p>" + (d3.time.format('%H:%M:%S')(new Date(obj.point.x))) + " | " + obj.point.y + "</p>";
      });
      nv.utils.windowResize(scope.chart.update);
      scope.setSize = function(size) {
        return scope.setMetricSize(scope.metric, size);
      };
      scope.showChart();
      return scope.$on('metrics:data:update', function(event, timestamp, data) {
        scope.value = parseInt(data[scope.metric.id]);
        scope.data[0].values.push({
          x: timestamp,
          y: scope.value
        });
        if (scope.data[0].values.length > scope.window) {
          scope.data[0].values.shift();
        }
        scope.showChart();
        scope.chart.clearHighlights();
        return scope.chart.tooltip.hidden(true);
      });
    }
  };
});

angular.module('flinkApp').service('MetricsService', ["$http", "$q", "flinkConfig", "$interval", function($http, $q, flinkConfig, $interval) {
  console.log('MetricsService');
  this.metrics = {};
  this.values = {};
  this.watched = {};
  this.observer = {
    jobid: null,
    nodeid: null,
    callback: null
  };
  this.refresh = $interval((function(_this) {
    return function() {
      return angular.forEach(_this.watched, function(v, jobid) {
        return angular.forEach(v, function(nodeid, nk) {
          return _this.getAllAvailableMetrics(jobid, nodeid).then(function(data) {
            var names;
            names = [];
            angular.forEach(data, function(metric, mk) {
              return names.push(metric.id);
            });
            return _this.getMetrics(jobid, nodeid, names).then(function(values) {
              if (jobid === _this.observer.jobid && nodeid === _this.observer.nodeid) {
                if (_this.observer.callback) {
                  return _this.observer.callback(values);
                }
              }
            });
          });
        });
      });
    };
  })(this), flinkConfig["refresh-interval"]);
  this.registerObserver = function(jobid, nodeid, callback) {
    this.observer.jobid = jobid;
    this.observer.nodeid = nodeid;
    return this.observer.callback = callback;
  };
  this.unRegisterObserver = function() {
    return this.observer = {
      jobid: null,
      nodeid: null,
      callback: null
    };
  };
  this.setupMetrics = function(jobid, vertices) {
    this.setupLS();
    this.watched[jobid] = [];
    return angular.forEach(vertices, (function(_this) {
      return function(v, k) {
        if (v.id) {
          return _this.watched[jobid].push(v.id);
        }
      };
    })(this));
  };
  this.getWindow = function() {
    return 100;
  };
  this.setupLS = function() {
    if (localStorage.flinkMetrics == null) {
      this.saveSetup();
    }
    return this.metrics = JSON.parse(localStorage.flinkMetrics);
  };
  this.saveSetup = function() {
    return localStorage.flinkMetrics = JSON.stringify(this.metrics);
  };
  this.saveValue = function(jobid, nodeid, value) {
    if (this.values[jobid] == null) {
      this.values[jobid] = {};
    }
    if (this.values[jobid][nodeid] == null) {
      this.values[jobid][nodeid] = [];
    }
    this.values[jobid][nodeid].push(value);
    if (this.values[jobid][nodeid].length > this.getWindow()) {
      return this.values[jobid][nodeid].shift();
    }
  };
  this.getValues = function(jobid, nodeid, metricid) {
    var results;
    if (this.values[jobid] == null) {
      return [];
    }
    if (this.values[jobid][nodeid] == null) {
      return [];
    }
    results = [];
    angular.forEach(this.values[jobid][nodeid], (function(_this) {
      return function(v, k) {
        if (v.values[metricid] != null) {
          return results.push({
            x: v.timestamp,
            y: v.values[metricid]
          });
        }
      };
    })(this));
    return results;
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
    this.metrics[jobid][nodeid].push({
      id: metricid,
      size: 'small'
    });
    return this.saveSetup();
  };
  this.removeMetric = (function(_this) {
    return function(jobid, nodeid, metric) {
      var i;
      if (_this.metrics[jobid][nodeid] != null) {
        i = _this.metrics[jobid][nodeid].indexOf(metric);
        if (i === -1) {
          i = _.findIndex(_this.metrics[jobid][nodeid], {
            id: metric
          });
        }
        if (i !== -1) {
          _this.metrics[jobid][nodeid].splice(i, 1);
        }
        return _this.saveSetup();
      }
    };
  })(this);
  this.setMetricSize = (function(_this) {
    return function(jobid, nodeid, metric, size) {
      var i;
      if (_this.metrics[jobid][nodeid] != null) {
        i = _this.metrics[jobid][nodeid].indexOf(metric.id);
        if (i === -1) {
          i = _.findIndex(_this.metrics[jobid][nodeid], {
            id: metric.id
          });
        }
        if (i !== -1) {
          _this.metrics[jobid][nodeid][i] = {
            id: metric.id,
            size: size
          };
        }
        return _this.saveSetup();
      }
    };
  })(this);
  this.orderMetrics = function(jobid, nodeid, item, index) {
    this.setupLSFor(jobid, nodeid);
    angular.forEach(this.metrics[jobid][nodeid], (function(_this) {
      return function(v, k) {
        if (v.id === item.id) {
          _this.metrics[jobid][nodeid].splice(k, 1);
          if (k < index) {
            return index = index - 1;
          }
        }
      };
    })(this));
    this.metrics[jobid][nodeid].splice(index, 0, item);
    return this.saveSetup();
  };
  this.getMetricsSetup = (function(_this) {
    return function(jobid, nodeid) {
      return {
        names: _.map(_this.metrics[jobid][nodeid], function(value) {
          if (_.isString(value)) {
            return {
              id: value,
              size: "small"
            };
          } else {
            return value;
          }
        })
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
          var i;
          i = _this.metrics[jobid][nodeid].indexOf(v.id);
          if (i === -1) {
            i = _.findIndex(_this.metrics[jobid][nodeid], {
              id: v.id
            });
          }
          if (i === -1) {
            return results.push(v);
          }
        });
        return deferred.resolve(results);
      });
      return deferred.promise;
    };
  })(this);
  this.getAllAvailableMetrics = (function(_this) {
    return function(jobid, nodeid) {
      var deferred;
      deferred = $q.defer();
      $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics").success(function(data) {
        return deferred.resolve(data);
      });
      return deferred.promise;
    };
  })(this);
  this.getMetrics = function(jobid, nodeid, metricIds) {
    var deferred, ids;
    deferred = $q.defer();
    ids = metricIds.join(",");
    $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics?get=" + ids).success((function(_this) {
      return function(data) {
        var newValue, result;
        result = {};
        angular.forEach(data, function(v, k) {
          return result[v.id] = parseInt(v.value);
        });
        newValue = {
          timestamp: Date.now(),
          values: result
        };
        _this.saveValue(jobid, nodeid, newValue);
        return deferred.resolve(newValue);
      };
    })(this));
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
    $http["delete"]("jars/" + encodeURIComponent(id)).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPlan = function(id, args) {
    var deferred;
    deferred = $q.defer();
    $http.get("jars/" + encodeURIComponent(id) + "/plan", {
      params: args
    }).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.runJob = function(id, args) {
    var deferred;
    deferred = $q.defer();
    $http.post("jars/" + encodeURIComponent(id) + "/run", {}, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsImluZGV4LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMuY29mZmVlIiwiY29tbW9uL2RpcmVjdGl2ZXMuanMiLCJjb21tb24vZmlsdGVycy5jb2ZmZWUiLCJjb21tb24vZmlsdGVycy5qcyIsImNvbW1vbi9zZXJ2aWNlcy5jb2ZmZWUiLCJjb21tb24vc2VydmljZXMuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvam9ibWFuYWdlci9qb2JtYW5hZ2VyLmN0cmwuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5zdmMuY29mZmVlIiwibW9kdWxlcy9qb2JtYW5hZ2VyL2pvYm1hbmFnZXIuc3ZjLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5jdHJsLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuZGlyLmNvZmZlZSIsIm1vZHVsZXMvam9icy9qb2JzLmRpci5qcyIsIm1vZHVsZXMvam9icy9qb2JzLnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5zdmMuanMiLCJtb2R1bGVzL2pvYnMvbWV0cmljcy5kaXIuY29mZmVlIiwibW9kdWxlcy9qb2JzL21ldHJpY3MuZGlyLmpzIiwibW9kdWxlcy9qb2JzL21ldHJpY3Muc3ZjLmNvZmZlZSIsIm1vZHVsZXMvam9icy9tZXRyaWNzLnN2Yy5qcyIsIm1vZHVsZXMvb3ZlcnZpZXcvb3ZlcnZpZXcuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LmN0cmwuanMiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5qcyIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmpzIiwibW9kdWxlcy9zdWJtaXQvc3VibWl0LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL3N1Ym1pdC9zdWJtaXQuc3ZjLmpzIiwibW9kdWxlcy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuY3RybC5qcyIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCQSxRQUFRLE9BQU8sWUFBWSxDQUFDLGFBQWEsaUJBQWlCLGFBSXpELG1CQUFJLFNBQUMsWUFBRDtFQUNILFdBQVcsaUJBQWlCO0VDckI1QixPRHNCQSxXQUFXLGNBQWMsV0FBQTtJQUN2QixXQUFXLGlCQUFpQixDQUFDLFdBQVc7SUNyQnhDLE9Ec0JBLFdBQVcsZUFBZTs7SUFJN0IsTUFBTSxlQUFlO0VBRXBCLFdBQVc7RUFDWCxvQkFBb0I7R0FLckIsK0RBQUksU0FBQyxhQUFhLGFBQWEsYUFBYSxXQUF4QztFQzVCSCxPRDZCQSxZQUFZLGFBQWEsS0FBSyxTQUFDLFFBQUQ7SUFDNUIsUUFBUSxPQUFPLGFBQWE7SUFJNUIsWUFBWTtJQy9CWixPRGlDQSxVQUFVLFdBQUE7TUNoQ1IsT0RpQ0EsWUFBWTtPQUNaLFlBQVk7O0lBS2pCLGlDQUFPLFNBQUMsdUJBQUQ7RUNuQ04sT0RvQ0Esc0JBQXNCO0lBSXZCLDZCQUFJLFNBQUMsWUFBWSxRQUFiO0VDdENILE9EdUNBLFdBQVcsSUFBSSxxQkFBcUIsU0FBQyxPQUFPLFNBQVMsVUFBVSxXQUEzQjtJQUNsQyxJQUFHLFFBQVEsWUFBWDtNQUNFLE1BQU07TUN0Q04sT0R1Q0EsT0FBTyxHQUFHLFFBQVEsWUFBWTs7O0lBSW5DLGdEQUFPLFNBQUMsZ0JBQWdCLG9CQUFqQjtFQUNOLGVBQWUsTUFBTSxZQUNuQjtJQUFBLEtBQUs7SUFDTCxPQUNFO01BQUEsTUFDRTtRQUFBLGFBQWE7UUFDYixZQUFZOzs7S0FFakIsTUFBTSxn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SUFBQTtJQUFBLFdBQVcsR0FBRztJQUVkLE1BQU0sSUFBSSxZQUFZLFlBQVksZ0JBQ2pDLFFBQVEsU0FBQyxNQUFNLFFBQVEsU0FBUyxRQUF4QjtNQ3BCUCxPRHFCQSxTQUFTLFFBQVEsS0FBSzs7SUNuQnhCLE9EcUJBLFNBQVM7O0VDbkJYLE9EcUJBO0lBRUQsUUFBUSwyREFBNEIsU0FBQyxPQUFPLGFBQWEsSUFBckI7RUFDbkMsS0FBQyxjQUFjLFNBQUMsZUFBRDtJQUNiLElBQUE7SUFBQSxXQUFXLEdBQUc7SUFFZCxNQUFNLElBQUksWUFBWSxZQUFZLGtCQUFrQixnQkFBZ0IsWUFDbkUsUUFBUSxTQUFDLE1BQU0sUUFBUSxTQUFTLFFBQXhCO01DdEJQLE9EdUJBLFNBQVMsUUFBUSxLQUFLOztJQ3JCeEIsT0R1QkEsU0FBUzs7RUFFWCxLQUFDLFdBQVcsU0FBQyxlQUFEO0lBQ1YsSUFBQTtJQUFBLFdBQVcsR0FBRztJQUVkLE1BQU0sSUFBSSxZQUFZLFlBQVksa0JBQWtCLGdCQUFnQixRQUNuRSxRQUFRLFNBQUMsTUFBTSxRQUFRLFNBQVMsUUFBeEI7TUN2QlAsT0R3QkEsU0FBUyxRQUFROztJQ3RCbkIsT0R3QkEsU0FBUzs7RUFFWCxLQUFDLGFBQWEsU0FBQyxlQUFEO0lBQ1osSUFBQTtJQUFBLFdBQVcsR0FBRztJQUVkLE1BQU0sSUFBSSxZQUFZLFlBQVksa0JBQWtCLGdCQUFnQixXQUNuRSxRQUFRLFNBQUMsTUFBTSxRQUFRLFNBQVMsUUFBeEI7TUN4QlAsT0R5QkEsU0FBUyxRQUFROztJQ3ZCbkIsT0R5QkEsU0FBUzs7RUN2QlgsT0R5QkE7O0FDdkJGIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcsIFsndWkucm91dGVyJywgJ2FuZ3VsYXJNb21lbnQnLCAnZG5kTGlzdHMnXSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4ucnVuICgkcm9vdFNjb3BlKSAtPlxuICAkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlID0gZmFsc2VcbiAgJHJvb3RTY29wZS5zaG93U2lkZWJhciA9IC0+XG4gICAgJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZSA9ICEkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlXG4gICAgJHJvb3RTY29wZS5zaWRlYmFyQ2xhc3MgPSAnZm9yY2Utc2hvdydcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4udmFsdWUgJ2ZsaW5rQ29uZmlnJywge1xuIyAgam9iU2VydmVyOiAnJ1xuICBqb2JTZXJ2ZXI6ICdodHRwOi8vbG9jYWxob3N0OjgwODEvJ1xuICBcInJlZnJlc2gtaW50ZXJ2YWxcIjogMTAwMDBcbn1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4ucnVuIChKb2JzU2VydmljZSwgTWFpblNlcnZpY2UsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwpIC0+XG4gIE1haW5TZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuIChjb25maWcpIC0+XG4gICAgYW5ndWxhci5leHRlbmQgZmxpbmtDb25maWcsIGNvbmZpZ1xuIyAgICBjb25zb2xlLmxvZyBmbGlua0NvbmZpZ1xuIyAgICBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0gPSAyMDAwMFxuXG4gICAgSm9ic1NlcnZpY2UubGlzdEpvYnMoKVxuXG4gICAgJGludGVydmFsIC0+XG4gICAgICBKb2JzU2VydmljZS5saXN0Sm9icygpXG4gICAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb25maWcgKCR1aVZpZXdTY3JvbGxQcm92aWRlcikgLT5cbiAgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnJ1biAoJHJvb3RTY29wZSwgJHN0YXRlKSAtPlxuICAkcm9vdFNjb3BlLiRvbiAnJHN0YXRlQ2hhbmdlU3RhcnQnLCAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUpIC0+XG4gICAgaWYgdG9TdGF0ZS5yZWRpcmVjdFRvXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAkc3RhdGUuZ28gdG9TdGF0ZS5yZWRpcmVjdFRvLCB0b1BhcmFtc1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb25maWcgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIC0+XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlIFwib3ZlcnZpZXdcIixcbiAgICB1cmw6IFwiL292ZXJ2aWV3XCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL292ZXJ2aWV3Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnT3ZlcnZpZXdDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInJ1bm5pbmctam9ic1wiLFxuICAgIHVybDogXCIvcnVubmluZy1qb2JzXCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvcnVubmluZy1qb2JzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnUnVubmluZ0pvYnNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcImNvbXBsZXRlZC1qb2JzXCIsXG4gICAgdXJsOiBcIi9jb21wbGV0ZWQtam9ic1wiXG4gICAgdmlld3M6XG4gICAgICBtYWluOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2NvbXBsZXRlZC1qb2JzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnQ29tcGxldGVkSm9ic0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYlwiLFxuICAgIHVybDogXCIvam9icy97am9iaWR9XCJcbiAgICBhYnN0cmFjdDogdHJ1ZVxuICAgIHZpZXdzOlxuICAgICAgbWFpbjpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVKb2JDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhblwiLFxuICAgIHVybDogXCJcIlxuICAgIHJlZGlyZWN0VG86IFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4uaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uc3VidGFza3NcIixcbiAgICB1cmw6IFwiXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5zdWJ0YXNrcy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5TdWJ0YXNrc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLm1ldHJpY3NcIixcbiAgICB1cmw6IFwiL21ldHJpY3NcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0Lm1ldHJpY3MuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuTWV0cmljc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLnRhc2ttYW5hZ2Vyc1wiLFxuICAgIHVybDogXCIvdGFza21hbmFnZXJzXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC50YXNrbWFuYWdlcnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuVGFza01hbmFnZXJzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uYWNjdW11bGF0b3JzXCIsXG4gICAgdXJsOiBcIi9hY2N1bXVsYXRvcnNcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmFjY3VtdWxhdG9ycy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50c1wiLFxuICAgIHVybDogXCIvY2hlY2twb2ludHNcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmNoZWNrcG9pbnRzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uYmFja3ByZXNzdXJlXCIsXG4gICAgdXJsOiBcIi9iYWNrcHJlc3N1cmVcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmJhY2twcmVzc3VyZS5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IudGltZWxpbmVcIixcbiAgICB1cmw6IFwiL3RpbWVsaW5lXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnRpbWVsaW5lLmh0bWxcIlxuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsXG4gICAgdXJsOiBcIi97dmVydGV4SWR9XCJcbiAgICB2aWV3czpcbiAgICAgIHZlcnRleDpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUudmVydGV4Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IuZXhjZXB0aW9uc1wiLFxuICAgIHVybDogXCIvZXhjZXB0aW9uc1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5leGNlcHRpb25zLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5jb25maWdcIixcbiAgICB1cmw6IFwiL2NvbmZpZ1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5jb25maWcuaHRtbFwiXG5cbiAgLnN0YXRlIFwiYWxsLW1hbmFnZXJcIixcbiAgICB1cmw6IFwiL3Rhc2ttYW5hZ2Vyc1wiXG4gICAgdmlld3M6XG4gICAgICBtYWluOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci9pbmRleC5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0FsbFRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLW1hbmFnZXJcIixcbiAgICAgIHVybDogXCIvdGFza21hbmFnZXIve3Rhc2ttYW5hZ2VyaWR9XCJcbiAgICAgIHZpZXdzOlxuICAgICAgICBtYWluOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLmh0bWxcIlxuXG4gIC5zdGF0ZSBcInNpbmdsZS1tYW5hZ2VyLm1ldHJpY3NcIixcbiAgICB1cmw6IFwiL21ldHJpY3NcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIubWV0cmljcy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZVRhc2tNYW5hZ2VyQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtbWFuYWdlci5zdGRvdXRcIixcbiAgICB1cmw6IFwiL3N0ZG91dFwiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5zdGRvdXQuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlclN0ZG91dENvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLW1hbmFnZXIubG9nXCIsXG4gICAgdXJsOiBcIi9sb2dcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIubG9nLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlVGFza01hbmFnZXJMb2dzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJqb2JtYW5hZ2VyXCIsXG4gICAgICB1cmw6IFwiL2pvYm1hbmFnZXJcIlxuICAgICAgdmlld3M6XG4gICAgICAgIG1haW46XG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9pbmRleC5odG1sXCJcblxuICAuc3RhdGUgXCJqb2JtYW5hZ2VyLmNvbmZpZ1wiLFxuICAgIHVybDogXCIvY29uZmlnXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvY29uZmlnLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iTWFuYWdlckNvbmZpZ0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwiam9ibWFuYWdlci5zdGRvdXRcIixcbiAgICB1cmw6IFwiL3N0ZG91dFwiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL3N0ZG91dC5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYk1hbmFnZXJTdGRvdXRDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcImpvYm1hbmFnZXIubG9nXCIsXG4gICAgdXJsOiBcIi9sb2dcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9sb2cuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JNYW5hZ2VyTG9nc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic3VibWl0XCIsXG4gICAgICB1cmw6IFwiL3N1Ym1pdFwiXG4gICAgICB2aWV3czpcbiAgICAgICAgbWFpbjpcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9zdWJtaXQuaHRtbFwiXG4gICAgICAgICAgY29udHJvbGxlcjogXCJKb2JTdWJtaXRDb250cm9sbGVyXCJcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlIFwiL292ZXJ2aWV3XCJcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcsIFsndWkucm91dGVyJywgJ2FuZ3VsYXJNb21lbnQnLCAnZG5kTGlzdHMnXSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZSA9IGZhbHNlO1xuICByZXR1cm4gJHJvb3RTY29wZS5zaG93U2lkZWJhciA9IGZ1bmN0aW9uKCkge1xuICAgICRyb290U2NvcGUuc2lkZWJhclZpc2libGUgPSAhJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZTtcbiAgICByZXR1cm4gJHJvb3RTY29wZS5zaWRlYmFyQ2xhc3MgPSAnZm9yY2Utc2hvdyc7XG4gIH07XG59KS52YWx1ZSgnZmxpbmtDb25maWcnLCB7XG4gIGpvYlNlcnZlcjogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MS8nLFxuICBcInJlZnJlc2gtaW50ZXJ2YWxcIjogMTAwMDBcbn0pLnJ1bihmdW5jdGlvbihKb2JzU2VydmljZSwgTWFpblNlcnZpY2UsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwpIHtcbiAgcmV0dXJuIE1haW5TZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuKGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIGFuZ3VsYXIuZXh0ZW5kKGZsaW5rQ29uZmlnLCBjb25maWcpO1xuICAgIEpvYnNTZXJ2aWNlLmxpc3RKb2JzKCk7XG4gICAgcmV0dXJuICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBKb2JzU2VydmljZS5saXN0Sm9icygpO1xuICAgIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIH0pO1xufSkuY29uZmlnKGZ1bmN0aW9uKCR1aVZpZXdTY3JvbGxQcm92aWRlcikge1xuICByZXR1cm4gJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpO1xufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSkge1xuICByZXR1cm4gJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUpIHtcbiAgICBpZiAodG9TdGF0ZS5yZWRpcmVjdFRvKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuICRzdGF0ZS5nbyh0b1N0YXRlLnJlZGlyZWN0VG8sIHRvUGFyYW1zKTtcbiAgICB9XG4gIH0pO1xufSkuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJvdmVydmlld1wiLCB7XG4gICAgdXJsOiBcIi9vdmVydmlld1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL292ZXJ2aWV3Lmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ092ZXJ2aWV3Q29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwicnVubmluZy1qb2JzXCIsIHtcbiAgICB1cmw6IFwiL3J1bm5pbmctam9ic1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvcnVubmluZy1qb2JzLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ1J1bm5pbmdKb2JzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwiY29tcGxldGVkLWpvYnNcIiwge1xuICAgIHVybDogXCIvY29tcGxldGVkLWpvYnNcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2NvbXBsZXRlZC1qb2JzLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0NvbXBsZXRlZEpvYnNDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iXCIsIHtcbiAgICB1cmw6IFwiL2pvYnMve2pvYmlkfVwiLFxuICAgIGFic3RyYWN0OiB0cnVlLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZUpvYkNvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhblwiLCB7XG4gICAgdXJsOiBcIlwiLFxuICAgIHJlZGlyZWN0VG86IFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtcbiAgICB1cmw6IFwiXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LnN1YnRhc2tzLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5TdWJ0YXNrc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5tZXRyaWNzXCIsIHtcbiAgICB1cmw6IFwiL21ldHJpY3NcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QubWV0cmljcy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuTWV0cmljc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi50YXNrbWFuYWdlcnNcIiwge1xuICAgIHVybDogXCIvdGFza21hbmFnZXJzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LnRhc2ttYW5hZ2Vycy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuVGFza01hbmFnZXJzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmFjY3VtdWxhdG9yc1wiLCB7XG4gICAgdXJsOiBcIi9hY2N1bXVsYXRvcnNcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYWNjdW11bGF0b3JzLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHNcIiwge1xuICAgIHVybDogXCIvY2hlY2twb2ludHNcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuY2hlY2twb2ludHMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmJhY2twcmVzc3VyZVwiLCB7XG4gICAgdXJsOiBcIi9iYWNrcHJlc3N1cmVcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYmFja3ByZXNzdXJlLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnRpbWVsaW5lXCIsIHtcbiAgICB1cmw6IFwiL3RpbWVsaW5lXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUuaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsIHtcbiAgICB1cmw6IFwiL3t2ZXJ0ZXhJZH1cIixcbiAgICB2aWV3czoge1xuICAgICAgdmVydGV4OiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnRpbWVsaW5lLnZlcnRleC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IuZXhjZXB0aW9uc1wiLCB7XG4gICAgdXJsOiBcIi9leGNlcHRpb25zXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuZXhjZXB0aW9ucy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5jb25maWdcIiwge1xuICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuY29uZmlnLmh0bWxcIlxuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJhbGwtbWFuYWdlclwiLCB7XG4gICAgdXJsOiBcIi90YXNrbWFuYWdlcnNcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci9pbmRleC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBbGxUYXNrTWFuYWdlcnNDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtbWFuYWdlclwiLCB7XG4gICAgdXJsOiBcIi90YXNrbWFuYWdlci97dGFza21hbmFnZXJpZH1cIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5odG1sXCJcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLW1hbmFnZXIubWV0cmljc1wiLCB7XG4gICAgdXJsOiBcIi9tZXRyaWNzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIubWV0cmljcy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlckNvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1tYW5hZ2VyLnN0ZG91dFwiLCB7XG4gICAgdXJsOiBcIi9zdGRvdXRcIixcbiAgICB2aWV3czoge1xuICAgICAgZGV0YWlsczoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5zdGRvdXQuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlVGFza01hbmFnZXJTdGRvdXRDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtbWFuYWdlci5sb2dcIiwge1xuICAgIHVybDogXCIvbG9nXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIubG9nLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImpvYm1hbmFnZXJcIiwge1xuICAgIHVybDogXCIvam9ibWFuYWdlclwiLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvaW5kZXguaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImpvYm1hbmFnZXIuY29uZmlnXCIsIHtcbiAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvY29uZmlnLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYk1hbmFnZXJDb25maWdDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJqb2JtYW5hZ2VyLnN0ZG91dFwiLCB7XG4gICAgdXJsOiBcIi9zdGRvdXRcIixcbiAgICB2aWV3czoge1xuICAgICAgZGV0YWlsczoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL3N0ZG91dC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwiam9ibWFuYWdlci5sb2dcIiwge1xuICAgIHVybDogXCIvbG9nXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9sb2cuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iTWFuYWdlckxvZ3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzdWJtaXRcIiwge1xuICAgIHVybDogXCIvc3VibWl0XCIsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvc3VibWl0Lmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogXCJKb2JTdWJtaXRDb250cm9sbGVyXCJcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9vdmVydmlld1wiKTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdic0xhYmVsJywgKEpvYnNTZXJ2aWNlKSAtPlxuICB0cmFuc2NsdWRlOiB0cnVlXG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6IFxuICAgIGdldExhYmVsQ2xhc3M6IFwiJlwiXG4gICAgc3RhdHVzOiBcIkBcIlxuXG4gIHRlbXBsYXRlOiBcIjxzcGFuIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0TGFiZWxDbGFzcygpJz48bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+PC9zcGFuPlwiXG4gIFxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmdldExhYmVsQ2xhc3MgPSAtPlxuICAgICAgJ2xhYmVsIGxhYmVsLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ2JwTGFiZWwnLCAoSm9ic1NlcnZpY2UpIC0+XG4gIHRyYW5zY2x1ZGU6IHRydWVcbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTpcbiAgICBnZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzOiBcIiZcIlxuICAgIHN0YXR1czogXCJAXCJcblxuICB0ZW1wbGF0ZTogXCI8c3BhbiB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3MoKSc+PG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPjwvc3Bhbj5cIlxuXG4gIGxpbms6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgc2NvcGUuZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzcyA9IC0+XG4gICAgICAnbGFiZWwgbGFiZWwtJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUJhY2tQcmVzc3VyZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAnaW5kaWNhdG9yUHJpbWFyeScsIChKb2JzU2VydmljZSkgLT5cbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTogXG4gICAgZ2V0TGFiZWxDbGFzczogXCImXCJcbiAgICBzdGF0dXM6ICdAJ1xuXG4gIHRlbXBsYXRlOiBcIjxpIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0TGFiZWxDbGFzcygpJyAvPlwiXG4gIFxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmdldExhYmVsQ2xhc3MgPSAtPlxuICAgICAgJ2ZhIGZhLWNpcmNsZSBpbmRpY2F0b3IgaW5kaWNhdG9yLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ3RhYmxlUHJvcGVydHknLCAtPlxuICByZXBsYWNlOiB0cnVlXG4gIHNjb3BlOlxuICAgIHZhbHVlOiAnPSdcblxuICB0ZW1wbGF0ZTogXCI8dGQgdGl0bGU9XFxcInt7dmFsdWUgfHwgJ05vbmUnfX1cXFwiPnt7dmFsdWUgfHwgJ05vbmUnfX08L3RkPlwiXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5kaXJlY3RpdmUoJ2JzTGFiZWwnLCBmdW5jdGlvbihKb2JzU2VydmljZSkge1xuICByZXR1cm4ge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgZ2V0TGFiZWxDbGFzczogXCImXCIsXG4gICAgICBzdGF0dXM6IFwiQFwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogXCI8c3BhbiB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldExhYmVsQ2xhc3MoKSc+PG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPjwvc3Bhbj5cIixcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHJldHVybiBzY29wZS5nZXRMYWJlbENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnbGFiZWwgbGFiZWwtJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufSkuZGlyZWN0aXZlKCdicExhYmVsJywgZnVuY3Rpb24oSm9ic1NlcnZpY2UpIHtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGdldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3M6IFwiJlwiLFxuICAgICAgc3RhdHVzOiBcIkBcIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiPHNwYW4gdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzKCknPjxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT48L3NwYW4+XCIsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gc2NvcGUuZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2xhYmVsIGxhYmVsLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVCYWNrUHJlc3N1cmVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cyk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnaW5kaWNhdG9yUHJpbWFyeScsIGZ1bmN0aW9uKEpvYnNTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgZ2V0TGFiZWxDbGFzczogXCImXCIsXG4gICAgICBzdGF0dXM6ICdAJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiPGkgdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRMYWJlbENsYXNzKCknIC8+XCIsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gc2NvcGUuZ2V0TGFiZWxDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2ZhIGZhLWNpcmNsZSBpbmRpY2F0b3IgaW5kaWNhdG9yLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cyk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgndGFibGVQcm9wZXJ0eScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHZhbHVlOiAnPSdcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBcIjx0ZCB0aXRsZT1cXFwie3t2YWx1ZSB8fCAnTm9uZSd9fVxcXCI+e3t2YWx1ZSB8fCAnTm9uZSd9fTwvdGQ+XCJcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5maWx0ZXIgXCJhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRcIiwgKGFuZ3VsYXJNb21lbnRDb25maWcpIC0+XG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlciA9ICh2YWx1ZSwgZm9ybWF0LCBkdXJhdGlvbkZvcm1hdCkgLT5cbiAgICByZXR1cm4gXCJcIiAgaWYgdHlwZW9mIHZhbHVlIGlzIFwidW5kZWZpbmVkXCIgb3IgdmFsdWUgaXMgbnVsbFxuXG4gICAgbW9tZW50LmR1cmF0aW9uKHZhbHVlLCBmb3JtYXQpLmZvcm1hdChkdXJhdGlvbkZvcm1hdCwgeyB0cmltOiBmYWxzZSB9KVxuXG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlci4kc3RhdGVmdWwgPSBhbmd1bGFyTW9tZW50Q29uZmlnLnN0YXRlZnVsRmlsdGVyc1xuXG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlclxuXG4uZmlsdGVyIFwiaHVtYW5pemVEdXJhdGlvblwiLCAtPlxuICAodmFsdWUsIHNob3J0KSAtPlxuICAgIHJldHVybiBcIlwiIGlmIHR5cGVvZiB2YWx1ZSBpcyBcInVuZGVmaW5lZFwiIG9yIHZhbHVlIGlzIG51bGxcbiAgICBtcyA9IHZhbHVlICUgMTAwMFxuICAgIHggPSBNYXRoLmZsb29yKHZhbHVlIC8gMTAwMClcbiAgICBzZWNvbmRzID0geCAlIDYwXG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDYwKVxuICAgIG1pbnV0ZXMgPSB4ICUgNjBcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gNjApXG4gICAgaG91cnMgPSB4ICUgMjRcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gMjQpXG4gICAgZGF5cyA9IHhcbiAgICBpZiBkYXlzID09IDBcbiAgICAgIGlmIGhvdXJzID09IDBcbiAgICAgICAgaWYgbWludXRlcyA9PSAwXG4gICAgICAgICAgaWYgc2Vjb25kcyA9PSAwXG4gICAgICAgICAgICByZXR1cm4gbXMgKyBcIm1zXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwicyBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgc2hvcnQgdGhlbiByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtXCIgZWxzZSByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiXG4gICAgZWxzZVxuICAgICAgaWYgc2hvcnQgdGhlbiByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoXCIgZWxzZSByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIlxuXG4uZmlsdGVyIFwiaHVtYW5pemVUZXh0XCIsIC0+XG4gICh0ZXh0KSAtPlxuICAgICMgVE9ETzogZXh0ZW5kLi4uIGEgbG90XG4gICAgaWYgdGV4dCB0aGVuIHRleHQucmVwbGFjZSgvJmd0Oy9nLCBcIj5cIikucmVwbGFjZSgvPGJyXFwvPi9nLFwiXCIpIGVsc2UgJydcblxuLmZpbHRlciBcImh1bWFuaXplQnl0ZXNcIiwgLT5cbiAgKGJ5dGVzKSAtPlxuICAgIHVuaXRzID0gW1wiQlwiLCBcIktCXCIsIFwiTUJcIiwgXCJHQlwiLCBcIlRCXCIsIFwiUEJcIiwgXCJFQlwiXVxuICAgIGNvbnZlcnRlciA9ICh2YWx1ZSwgcG93ZXIpIC0+XG4gICAgICBiYXNlID0gTWF0aC5wb3coMTAyNCwgcG93ZXIpXG4gICAgICBpZiB2YWx1ZSA8IGJhc2VcbiAgICAgICAgcmV0dXJuICh2YWx1ZSAvIGJhc2UpLnRvRml4ZWQoMikgKyBcIiBcIiArIHVuaXRzW3Bvd2VyXVxuICAgICAgZWxzZSBpZiB2YWx1ZSA8IGJhc2UgKiAxMDAwXG4gICAgICAgIHJldHVybiAodmFsdWUgLyBiYXNlKS50b1ByZWNpc2lvbigzKSArIFwiIFwiICsgdW5pdHNbcG93ZXJdXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIHBvd2VyICsgMSlcbiAgICByZXR1cm4gXCJcIiBpZiB0eXBlb2YgYnl0ZXMgaXMgXCJ1bmRlZmluZWRcIiBvciBieXRlcyBpcyBudWxsXG4gICAgaWYgYnl0ZXMgPCAxMDAwIHRoZW4gYnl0ZXMgKyBcIiBCXCIgZWxzZSBjb252ZXJ0ZXIoYnl0ZXMsIDEpXG5cbi5maWx0ZXIgXCJ0b1VwcGVyQ2FzZVwiLCAtPlxuICAodGV4dCkgLT4gdGV4dC50b1VwcGVyQ2FzZSgpXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5maWx0ZXIoXCJhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRcIiwgZnVuY3Rpb24oYW5ndWxhck1vbWVudENvbmZpZykge1xuICB2YXIgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyO1xuICBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXIgPSBmdW5jdGlvbih2YWx1ZSwgZm9ybWF0LCBkdXJhdGlvbkZvcm1hdCkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gbW9tZW50LmR1cmF0aW9uKHZhbHVlLCBmb3JtYXQpLmZvcm1hdChkdXJhdGlvbkZvcm1hdCwge1xuICAgICAgdHJpbTogZmFsc2VcbiAgICB9KTtcbiAgfTtcbiAgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyLiRzdGF0ZWZ1bCA9IGFuZ3VsYXJNb21lbnRDb25maWcuc3RhdGVmdWxGaWx0ZXJzO1xuICByZXR1cm4gYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyO1xufSkuZmlsdGVyKFwiaHVtYW5pemVEdXJhdGlvblwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBzaG9ydCkge1xuICAgIHZhciBkYXlzLCBob3VycywgbWludXRlcywgbXMsIHNlY29uZHMsIHg7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIiB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIG1zID0gdmFsdWUgJSAxMDAwO1xuICAgIHggPSBNYXRoLmZsb29yKHZhbHVlIC8gMTAwMCk7XG4gICAgc2Vjb25kcyA9IHggJSA2MDtcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gNjApO1xuICAgIG1pbnV0ZXMgPSB4ICUgNjA7XG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDYwKTtcbiAgICBob3VycyA9IHggJSAyNDtcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gMjQpO1xuICAgIGRheXMgPSB4O1xuICAgIGlmIChkYXlzID09PSAwKSB7XG4gICAgICBpZiAoaG91cnMgPT09IDApIHtcbiAgICAgICAgaWYgKG1pbnV0ZXMgPT09IDApIHtcbiAgICAgICAgICBpZiAoc2Vjb25kcyA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG1zICsgXCJtc1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwicyBcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzaG9ydCkge1xuICAgICAgICAgIHJldHVybiBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm1cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzaG9ydCkge1xuICAgICAgICByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KS5maWx0ZXIoXCJodW1hbml6ZVRleHRcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLzxiclxcLz4vZywgXCJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH07XG59KS5maWx0ZXIoXCJodW1hbml6ZUJ5dGVzXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICB2YXIgY29udmVydGVyLCB1bml0cztcbiAgICB1bml0cyA9IFtcIkJcIiwgXCJLQlwiLCBcIk1CXCIsIFwiR0JcIiwgXCJUQlwiLCBcIlBCXCIsIFwiRUJcIl07XG4gICAgY29udmVydGVyID0gZnVuY3Rpb24odmFsdWUsIHBvd2VyKSB7XG4gICAgICB2YXIgYmFzZTtcbiAgICAgIGJhc2UgPSBNYXRoLnBvdygxMDI0LCBwb3dlcik7XG4gICAgICBpZiAodmFsdWUgPCBiYXNlKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgLyBiYXNlKS50b0ZpeGVkKDIpICsgXCIgXCIgKyB1bml0c1twb3dlcl07XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgYmFzZSAqIDEwMDApIHtcbiAgICAgICAgcmV0dXJuICh2YWx1ZSAvIGJhc2UpLnRvUHJlY2lzaW9uKDMpICsgXCIgXCIgKyB1bml0c1twb3dlcl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBwb3dlciArIDEpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHR5cGVvZiBieXRlcyA9PT0gXCJ1bmRlZmluZWRcIiB8fCBieXRlcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChieXRlcyA8IDEwMDApIHtcbiAgICAgIHJldHVybiBieXRlcyArIFwiIEJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnZlcnRlcihieXRlcywgMSk7XG4gICAgfVxuICB9O1xufSkuZmlsdGVyKFwidG9VcHBlckNhc2VcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9VcHBlckNhc2UoKTtcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdNYWluU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBAbG9hZENvbmZpZyA9IC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJjb25maWdcIlxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ01haW5TZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB0aGlzLmxvYWRDb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImNvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uY29udHJvbGxlciAnSm9iTWFuYWdlckNvbmZpZ0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JNYW5hZ2VyQ29uZmlnU2VydmljZSkgLT5cbiAgSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UubG9hZENvbmZpZygpLnRoZW4gKGRhdGEpIC0+XG4gICAgaWYgISRzY29wZS5qb2JtYW5hZ2VyP1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fVxuICAgICRzY29wZS5qb2JtYW5hZ2VyWydjb25maWcnXSA9IGRhdGFcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYk1hbmFnZXJMb2dzU2VydmljZSkgLT5cbiAgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlLmxvYWRMb2dzKCkudGhlbiAoZGF0YSkgLT5cbiAgICBpZiAhJHNjb3BlLmpvYm1hbmFnZXI/XG4gICAgICAkc2NvcGUuam9ibWFuYWdlciA9IHt9XG4gICAgJHNjb3BlLmpvYm1hbmFnZXJbJ2xvZyddID0gZGF0YVxuXG4gICRzY29wZS5yZWxvYWREYXRhID0gKCkgLT5cbiAgICBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UubG9hZExvZ3MoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmpvYm1hbmFnZXJbJ2xvZyddID0gZGF0YVxuXG4uY29udHJvbGxlciAnSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JNYW5hZ2VyU3Rkb3V0U2VydmljZSkgLT5cbiAgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UubG9hZFN0ZG91dCgpLnRoZW4gKGRhdGEpIC0+XG4gICAgaWYgISRzY29wZS5qb2JtYW5hZ2VyP1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fVxuICAgICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UubG9hZFN0ZG91dCgpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuam9ibWFuYWdlclsnc3Rkb3V0J10gPSBkYXRhXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5jb250cm9sbGVyKCdKb2JNYW5hZ2VyQ29uZmlnQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UpIHtcbiAgcmV0dXJuIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoJHNjb3BlLmpvYm1hbmFnZXIgPT0gbnVsbCkge1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydjb25maWcnXSA9IGRhdGE7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iTWFuYWdlckxvZ3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UpIHtcbiAgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlLmxvYWRMb2dzKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCRzY29wZS5qb2JtYW5hZ2VyID09IG51bGwpIHtcbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge307XG4gICAgfVxuICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnbG9nJ10gPSBkYXRhO1xuICB9KTtcbiAgcmV0dXJuICRzY29wZS5yZWxvYWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG59KS5jb250cm9sbGVyKCdKb2JNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UpIHtcbiAgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UubG9hZFN0ZG91dCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICgkc2NvcGUuam9ibWFuYWdlciA9PSBudWxsKSB7XG4gICAgICAkc2NvcGUuam9ibWFuYWdlciA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gJHNjb3BlLmpvYm1hbmFnZXJbJ3N0ZG91dCddID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUucmVsb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JNYW5hZ2VyU3Rkb3V0U2VydmljZS5sb2FkU3Rkb3V0KCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLmpvYm1hbmFnZXJbJ3N0ZG91dCddID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyQ29uZmlnU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBjb25maWcgPSB7fVxuXG4gIEBsb2FkQ29uZmlnID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvY29uZmlnXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgY29uZmlnID0gZGF0YVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcblxuLnNlcnZpY2UgJ0pvYk1hbmFnZXJMb2dzU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBsb2dzID0ge31cblxuICBAbG9hZExvZ3MgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9ibWFuYWdlci9sb2dcIilcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBsb2dzID0gZGF0YVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcblxuLnNlcnZpY2UgJ0pvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIHN0ZG91dCA9IHt9XG5cbiAgQGxvYWRTdGRvdXQgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9ibWFuYWdlci9zdGRvdXRcIilcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBzdGRvdXQgPSBkYXRhXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgZmxpbmtDb25maWcsICRxKSB7XG4gIHZhciBjb25maWc7XG4gIGNvbmZpZyA9IHt9O1xuICB0aGlzLmxvYWRDb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvY29uZmlnXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIGNvbmZpZyA9IGRhdGE7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KS5zZXJ2aWNlKCdKb2JNYW5hZ2VyTG9nc1NlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgZmxpbmtDb25maWcsICRxKSB7XG4gIHZhciBsb2dzO1xuICBsb2dzID0ge307XG4gIHRoaXMubG9hZExvZ3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvbG9nXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIGxvZ3MgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgZmxpbmtDb25maWcsICRxKSB7XG4gIHZhciBzdGRvdXQ7XG4gIHN0ZG91dCA9IHt9O1xuICB0aGlzLmxvYWRTdGRvdXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvc3Rkb3V0XCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHN0ZG91dCA9IGRhdGE7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uY29udHJvbGxlciAnUnVubmluZ0pvYnNDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSAtPlxuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSAtPlxuICAgICRzY29wZS5qb2JzID0gSm9ic1NlcnZpY2UuZ2V0Sm9icygncnVubmluZycpXG5cbiAgSm9ic1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICBKb2JzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuXG4gICRzY29wZS5qb2JPYnNlcnZlcigpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0NvbXBsZXRlZEpvYnNDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSAtPlxuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSAtPlxuICAgICRzY29wZS5qb2JzID0gSm9ic1NlcnZpY2UuZ2V0Sm9icygnZmluaXNoZWQnKVxuXG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcblxuICAkc2NvcGUuam9iT2JzZXJ2ZXIoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdTaW5nbGVKb2JDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlLCBNZXRyaWNzU2VydmljZSwgJHJvb3RTY29wZSwgZmxpbmtDb25maWcsICRpbnRlcnZhbCkgLT5cbiAgY29uc29sZS5sb2cgJ1NpbmdsZUpvYkNvbnRyb2xsZXInXG5cbiAgJHNjb3BlLmpvYmlkID0gJHN0YXRlUGFyYW1zLmpvYmlkXG4gICRzY29wZS5qb2IgPSBudWxsXG4gICRzY29wZS5wbGFuID0gbnVsbFxuICAkc2NvcGUudmVydGljZXMgPSBudWxsXG4gICRzY29wZS5qb2JDaGVja3BvaW50U3RhdHMgPSBudWxsXG4gICRzY29wZS5zaG93SGlzdG9yeSA9IGZhbHNlXG4gICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzID0ge31cblxuICBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUuam9iID0gZGF0YVxuICAgICRzY29wZS5wbGFuID0gZGF0YS5wbGFuXG4gICAgJHNjb3BlLnZlcnRpY2VzID0gZGF0YS52ZXJ0aWNlc1xuICAgIE1ldHJpY3NTZXJ2aWNlLnNldHVwTWV0cmljcygkc3RhdGVQYXJhbXMuam9iaWQsIGRhdGEudmVydGljZXMpXG5cbiAgcmVmcmVzaGVyID0gJGludGVydmFsIC0+XG4gICAgSm9ic1NlcnZpY2UubG9hZEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuam9iID0gZGF0YVxuXG4gICAgICAkc2NvcGUuJGJyb2FkY2FzdCAncmVsb2FkJ1xuXG4gICwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdXG5cbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgICRzY29wZS5qb2IgPSBudWxsXG4gICAgJHNjb3BlLnBsYW4gPSBudWxsXG4gICAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbFxuICAgICRzY29wZS5qb2JDaGVja3BvaW50U3RhdHMgPSBudWxsXG4gICAgJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHMgPSBudWxsXG5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2hlcilcblxuICAkc2NvcGUuY2FuY2VsSm9iID0gKGNhbmNlbEV2ZW50KSAtPlxuICAgIGFuZ3VsYXIuZWxlbWVudChjYW5jZWxFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ0NhbmNlbGxpbmcuLi4nKVxuICAgIEpvYnNTZXJ2aWNlLmNhbmNlbEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICB7fVxuXG4gICRzY29wZS5zdG9wSm9iID0gKHN0b3BFdmVudCkgLT5cbiAgICBhbmd1bGFyLmVsZW1lbnQoc3RvcEV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiYnRuXCIpLnJlbW92ZUNsYXNzKFwiYnRuLWRlZmF1bHRcIikuaHRtbCgnU3RvcHBpbmcuLi4nKVxuICAgIEpvYnNTZXJ2aWNlLnN0b3BKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAge31cblxuICAkc2NvcGUudG9nZ2xlSGlzdG9yeSA9IC0+XG4gICAgJHNjb3BlLnNob3dIaXN0b3J5ID0gISRzY29wZS5zaG93SGlzdG9yeVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgY29uc29sZS5sb2cgJ0pvYlBsYW5Db250cm9sbGVyJ1xuXG4gICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZVxuICAkc2NvcGUuc3RhdGVMaXN0ID0gSm9ic1NlcnZpY2Uuc3RhdGVMaXN0KClcblxuICAkc2NvcGUuY2hhbmdlTm9kZSA9IChub2RlaWQpIC0+XG4gICAgaWYgbm9kZWlkICE9ICRzY29wZS5ub2RlaWRcbiAgICAgICRzY29wZS5ub2RlaWQgPSBub2RlaWRcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbFxuXG4gICAgICAkc2NvcGUuJGJyb2FkY2FzdCAncmVsb2FkJ1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ25vZGU6Y2hhbmdlJywgJHNjb3BlLm5vZGVpZFxuXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZVxuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGxcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGxcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsXG4gICAgICAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsXG5cbiAgJHNjb3BlLmRlYWN0aXZhdGVOb2RlID0gLT5cbiAgICAkc2NvcGUubm9kZWlkID0gbnVsbFxuICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZVxuICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsXG4gICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbFxuXG4gICRzY29wZS50b2dnbGVGb2xkID0gLT5cbiAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gISRzY29wZS5ub2RlVW5mb2xkZWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcidcblxuICBnZXRTdWJ0YXNrcyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0U3VidGFza3MoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IGRhdGFcblxuICBpZiAkc2NvcGUubm9kZWlkIGFuZCAoISRzY29wZS52ZXJ0ZXggb3IgISRzY29wZS52ZXJ0ZXguc3QpXG4gICAgZ2V0U3VidGFza3MoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyAnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcidcbiAgICBnZXRTdWJ0YXNrcygpIGlmICRzY29wZS5ub2RlaWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSkgLT5cbiAgY29uc29sZS5sb2cgJ0pvYlBsYW5UYXNrTWFuYWdlcnNDb250cm9sbGVyJ1xuXG4gIGdldFRhc2tNYW5hZ2VycyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0VGFza01hbmFnZXJzKCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUudGFza21hbmFnZXJzID0gZGF0YVxuXG4gIGlmICRzY29wZS5ub2RlaWQgYW5kICghJHNjb3BlLnZlcnRleCBvciAhJHNjb3BlLnZlcnRleC5zdClcbiAgICBnZXRUYXNrTWFuYWdlcnMoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyAnSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInXG4gICAgZ2V0VGFza01hbmFnZXJzKCkgaWYgJHNjb3BlLm5vZGVpZFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInXG5cbiAgZ2V0QWNjdW11bGF0b3JzID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRBY2N1bXVsYXRvcnMoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBkYXRhLm1haW5cbiAgICAgICRzY29wZS5zdWJ0YXNrQWNjdW11bGF0b3JzID0gZGF0YS5zdWJ0YXNrc1xuXG4gIGlmICRzY29wZS5ub2RlaWQgYW5kICghJHNjb3BlLnZlcnRleCBvciAhJHNjb3BlLnZlcnRleC5hY2N1bXVsYXRvcnMpXG4gICAgZ2V0QWNjdW11bGF0b3JzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJ1xuICAgIGdldEFjY3VtdWxhdG9ycygpIGlmICRzY29wZS5ub2RlaWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcblxuICBnZXRKb2JDaGVja3BvaW50U3RhdHMgPSAtPlxuICAgIEpvYnNTZXJ2aWNlLmdldEpvYkNoZWNrcG9pbnRTdGF0cygkc2NvcGUuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuam9iQ2hlY2twb2ludFN0YXRzID0gZGF0YVxuXG4gIGdldE9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cygkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gZGF0YS5vcGVyYXRvclN0YXRzXG4gICAgICAkc2NvcGUuc3VidGFza3NDaGVja3BvaW50U3RhdHMgPSBkYXRhLnN1YnRhc2tzU3RhdHNcblxuICAjIEdldCB0aGUgcGVyIGpvYiBzdGF0c1xuICBnZXRKb2JDaGVja3BvaW50U3RhdHMoKVxuXG4gICMgR2V0IHRoZSBwZXIgb3BlcmF0b3Igc3RhdHNcbiAgaWYgJHNjb3BlLm5vZGVpZCBhbmQgKCEkc2NvcGUudmVydGV4IG9yICEkc2NvcGUudmVydGV4Lm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzKVxuICAgIGdldE9wZXJhdG9yQ2hlY2twb2ludFN0YXRzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cgJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInXG5cbiAgICBnZXRKb2JDaGVja3BvaW50U3RhdHMoKVxuICAgIGdldE9wZXJhdG9yQ2hlY2twb2ludFN0YXRzKCkgaWYgJHNjb3BlLm5vZGVpZFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQmFja1ByZXNzdXJlQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBjb25zb2xlLmxvZyAnSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInXG5cbiAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSAtPlxuICAgICRzY29wZS5ub3cgPSBEYXRlLm5vdygpXG5cbiAgICBpZiAkc2NvcGUubm9kZWlkXG4gICAgICBKb2JzU2VydmljZS5nZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHNbJHNjb3BlLm5vZGVpZF0gPSBkYXRhXG5cbiAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyAnSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXIgKHJlbG9hZCknXG4gICAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIC0+XG4gIGNvbnNvbGUubG9nICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInXG5cbiAgZ2V0VmVydGV4ID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRWZXJ0ZXgoJHN0YXRlUGFyYW1zLnZlcnRleElkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLnZlcnRleCA9IGRhdGFcblxuICBnZXRWZXJ0ZXgoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyAnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJ1xuICAgIGdldFZlcnRleCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYkV4Y2VwdGlvbnNDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSAtPlxuICBKb2JzU2VydmljZS5sb2FkRXhjZXB0aW9ucygpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLmV4Y2VwdGlvbnMgPSBkYXRhXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlByb3BlcnRpZXNDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UpIC0+XG4gIGNvbnNvbGUubG9nICdKb2JQcm9wZXJ0aWVzQ29udHJvbGxlcidcblxuICAkc2NvcGUuY2hhbmdlTm9kZSA9IChub2RlaWQpIC0+XG4gICAgaWYgbm9kZWlkICE9ICRzY29wZS5ub2RlaWRcbiAgICAgICRzY29wZS5ub2RlaWQgPSBub2RlaWRcblxuICAgICAgSm9ic1NlcnZpY2UuZ2V0Tm9kZShub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS5ub2RlID0gZGF0YVxuXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgICAgICRzY29wZS5ub2RlID0gbnVsbFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuTWV0cmljc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UpIC0+XG4gIGNvbnNvbGUubG9nICdKb2JQbGFuTWV0cmljc0NvbnRyb2xsZXInXG5cbiAgJHNjb3BlLmRyYWdnaW5nID0gZmFsc2VcbiAgJHNjb3BlLndpbmRvdyA9IE1ldHJpY3NTZXJ2aWNlLmdldFdpbmRvdygpXG4gICRzY29wZS5hdmFpbGFibGVNZXRyaWNzID0gbnVsbFxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICBNZXRyaWNzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoKVxuXG4gIGxvYWRNZXRyaWNzID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRWZXJ0ZXgoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS52ZXJ0ZXggPSBkYXRhXG5cbiAgICBNZXRyaWNzU2VydmljZS5nZXRBdmFpbGFibGVNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5hdmFpbGFibGVNZXRyaWNzID0gZGF0YVxuICAgICAgJHNjb3BlLm1ldHJpY3MgPSBNZXRyaWNzU2VydmljZS5nZXRNZXRyaWNzU2V0dXAoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkKS5uYW1lc1xuXG4gICAgICBNZXRyaWNzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0IFwibWV0cmljczpkYXRhOnVwZGF0ZVwiLCBkYXRhLnRpbWVzdGFtcCwgZGF0YS52YWx1ZXNcbiAgICAgIClcblxuICAkc2NvcGUuZHJvcHBlZCA9IChldmVudCwgaW5kZXgsIGl0ZW0sIGV4dGVybmFsLCB0eXBlKSAtPlxuXG4gICAgTWV0cmljc1NlcnZpY2Uub3JkZXJNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgaXRlbSwgaW5kZXgpXG4gICAgJHNjb3BlLiRicm9hZGNhc3QgXCJtZXRyaWNzOnJlZnJlc2hcIiwgaXRlbVxuICAgIGxvYWRNZXRyaWNzKClcbiAgICBmYWxzZVxuXG4gICRzY29wZS5kcmFnU3RhcnQgPSAtPlxuICAgICRzY29wZS5kcmFnZ2luZyA9IHRydWVcblxuICAkc2NvcGUuZHJhZ0VuZCA9IC0+XG4gICAgJHNjb3BlLmRyYWdnaW5nID0gZmFsc2VcblxuICAkc2NvcGUuYWRkTWV0cmljID0gKG1ldHJpYykgLT5cbiAgICBNZXRyaWNzU2VydmljZS5hZGRNZXRyaWMoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBtZXRyaWMuaWQpXG4gICAgbG9hZE1ldHJpY3MoKVxuXG4gICRzY29wZS5yZW1vdmVNZXRyaWMgPSAobWV0cmljKSAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLnJlbW92ZU1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYylcbiAgICBsb2FkTWV0cmljcygpXG5cbiAgJHNjb3BlLnNldE1ldHJpY1NpemUgPSAobWV0cmljLCBzaXplKSAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLnNldE1ldHJpY1NpemUoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBtZXRyaWMsIHNpemUpXG4gICAgbG9hZE1ldHJpY3MoKVxuXG4gICRzY29wZS5nZXRWYWx1ZXMgPSAobWV0cmljKSAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLmdldFZhbHVlcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYylcblxuICAkc2NvcGUuJG9uICdub2RlOmNoYW5nZScsIChldmVudCwgbm9kZWlkKSAtPlxuICAgIGxvYWRNZXRyaWNzKCkgaWYgISRzY29wZS5kcmFnZ2luZ1xuXG4gIGxvYWRNZXRyaWNzKCkgaWYgJHNjb3BlLm5vZGVpZFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5jb250cm9sbGVyKCdSdW5uaW5nSm9ic0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLmpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdydW5uaW5nJyk7XG4gIH07XG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLmpvYk9ic2VydmVyKCk7XG59KS5jb250cm9sbGVyKCdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gICRzY29wZS5qb2JPYnNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJyk7XG4gIH07XG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLmpvYk9ic2VydmVyKCk7XG59KS5jb250cm9sbGVyKCdTaW5nbGVKb2JDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UsIE1ldHJpY3NTZXJ2aWNlLCAkcm9vdFNjb3BlLCBmbGlua0NvbmZpZywgJGludGVydmFsKSB7XG4gIHZhciByZWZyZXNoZXI7XG4gIGNvbnNvbGUubG9nKCdTaW5nbGVKb2JDb250cm9sbGVyJyk7XG4gICRzY29wZS5qb2JpZCA9ICRzdGF0ZVBhcmFtcy5qb2JpZDtcbiAgJHNjb3BlLmpvYiA9IG51bGw7XG4gICRzY29wZS5wbGFuID0gbnVsbDtcbiAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbDtcbiAgJHNjb3BlLmpvYkNoZWNrcG9pbnRTdGF0cyA9IG51bGw7XG4gICRzY29wZS5zaG93SGlzdG9yeSA9IGZhbHNlO1xuICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IHt9O1xuICBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgJHNjb3BlLmpvYiA9IGRhdGE7XG4gICAgJHNjb3BlLnBsYW4gPSBkYXRhLnBsYW47XG4gICAgJHNjb3BlLnZlcnRpY2VzID0gZGF0YS52ZXJ0aWNlcztcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2Uuc2V0dXBNZXRyaWNzKCRzdGF0ZVBhcmFtcy5qb2JpZCwgZGF0YS52ZXJ0aWNlcyk7XG4gIH0pO1xuICByZWZyZXNoZXIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmxvYWRKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5qb2IgPSBkYXRhO1xuICAgICAgcmV0dXJuICRzY29wZS4kYnJvYWRjYXN0KCdyZWxvYWQnKTtcbiAgICB9KTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuam9iID0gbnVsbDtcbiAgICAkc2NvcGUucGxhbiA9IG51bGw7XG4gICAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbDtcbiAgICAkc2NvcGUuam9iQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IG51bGw7XG4gICAgcmV0dXJuICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaGVyKTtcbiAgfSk7XG4gICRzY29wZS5jYW5jZWxKb2IgPSBmdW5jdGlvbihjYW5jZWxFdmVudCkge1xuICAgIGFuZ3VsYXIuZWxlbWVudChjYW5jZWxFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ0NhbmNlbGxpbmcuLi4nKTtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuY2FuY2VsSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS5zdG9wSm9iID0gZnVuY3Rpb24oc3RvcEV2ZW50KSB7XG4gICAgYW5ndWxhci5lbGVtZW50KHN0b3BFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ1N0b3BwaW5nLi4uJyk7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnN0b3BKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS50b2dnbGVIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5zaG93SGlzdG9yeSA9ICEkc2NvcGUuc2hvd0hpc3Rvcnk7XG4gIH07XG59KS5jb250cm9sbGVyKCdKb2JQbGFuQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuQ29udHJvbGxlcicpO1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAkc2NvcGUuc3RhdGVMaXN0ID0gSm9ic1NlcnZpY2Uuc3RhdGVMaXN0KCk7XG4gICRzY29wZS5jaGFuZ2VOb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgaWYgKG5vZGVpZCAhPT0gJHNjb3BlLm5vZGVpZCkge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZDtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsO1xuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdyZWxvYWQnKTtcbiAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdCgnbm9kZTpjaGFuZ2UnLCAkc2NvcGUubm9kZWlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2U7XG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbDtcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmRlYWN0aXZhdGVOb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgcmV0dXJuICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IG51bGw7XG4gIH07XG4gIHJldHVybiAkc2NvcGUudG9nZ2xlRm9sZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUubm9kZVVuZm9sZGVkID0gISRzY29wZS5ub2RlVW5mb2xkZWQ7XG4gIH07XG59KS5jb250cm9sbGVyKCdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0U3VidGFza3M7XG4gIGNvbnNvbGUubG9nKCdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJyk7XG4gIGdldFN1YnRhc2tzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldFN1YnRhc2tzKCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrcyA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG4gIGlmICgkc2NvcGUubm9kZWlkICYmICghJHNjb3BlLnZlcnRleCB8fCAhJHNjb3BlLnZlcnRleC5zdCkpIHtcbiAgICBnZXRTdWJ0YXNrcygpO1xuICB9XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJyk7XG4gICAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICAgIHJldHVybiBnZXRTdWJ0YXNrcygpO1xuICAgIH1cbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JQbGFuVGFza01hbmFnZXJzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9ic1NlcnZpY2UpIHtcbiAgdmFyIGdldFRhc2tNYW5hZ2VycztcbiAgY29uc29sZS5sb2coJ0pvYlBsYW5UYXNrTWFuYWdlcnNDb250cm9sbGVyJyk7XG4gIGdldFRhc2tNYW5hZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRUYXNrTWFuYWdlcnMoJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLnRhc2ttYW5hZ2VycyA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG4gIGlmICgkc2NvcGUubm9kZWlkICYmICghJHNjb3BlLnZlcnRleCB8fCAhJHNjb3BlLnZlcnRleC5zdCkpIHtcbiAgICBnZXRUYXNrTWFuYWdlcnMoKTtcbiAgfVxuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldFRhc2tNYW5hZ2VycygpO1xuICAgIH1cbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9ic1NlcnZpY2UpIHtcbiAgdmFyIGdldEFjY3VtdWxhdG9ycztcbiAgY29uc29sZS5sb2coJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJyk7XG4gIGdldEFjY3VtdWxhdG9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRBY2N1bXVsYXRvcnMoJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gZGF0YS5tYWluO1xuICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrQWNjdW11bGF0b3JzID0gZGF0YS5zdWJ0YXNrcztcbiAgICB9KTtcbiAgfTtcbiAgaWYgKCRzY29wZS5ub2RlaWQgJiYgKCEkc2NvcGUudmVydGV4IHx8ICEkc2NvcGUudmVydGV4LmFjY3VtdWxhdG9ycykpIHtcbiAgICBnZXRBY2N1bXVsYXRvcnMoKTtcbiAgfVxuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldEFjY3VtdWxhdG9ycygpO1xuICAgIH1cbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0Sm9iQ2hlY2twb2ludFN0YXRzLCBnZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cztcbiAgY29uc29sZS5sb2coJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInKTtcbiAgZ2V0Sm9iQ2hlY2twb2ludFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldEpvYkNoZWNrcG9pbnRTdGF0cygkc2NvcGUuam9iaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5qb2JDaGVja3BvaW50U3RhdHMgPSBkYXRhO1xuICAgIH0pO1xuICB9O1xuICBnZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cygkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IGRhdGEub3BlcmF0b3JTdGF0cztcbiAgICAgIHJldHVybiAkc2NvcGUuc3VidGFza3NDaGVja3BvaW50U3RhdHMgPSBkYXRhLnN1YnRhc2tzU3RhdHM7XG4gICAgfSk7XG4gIH07XG4gIGdldEpvYkNoZWNrcG9pbnRTdGF0cygpO1xuICBpZiAoJHNjb3BlLm5vZGVpZCAmJiAoISRzY29wZS52ZXJ0ZXggfHwgISRzY29wZS52ZXJ0ZXgub3BlcmF0b3JDaGVja3BvaW50U3RhdHMpKSB7XG4gICAgZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMoKTtcbiAgfVxuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcicpO1xuICAgIGdldEpvYkNoZWNrcG9pbnRTdGF0cygpO1xuICAgIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgICByZXR1cm4gZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMoKTtcbiAgICB9XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZTtcbiAgY29uc29sZS5sb2coJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJyk7XG4gIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm5vdyA9IERhdGUubm93KCk7XG4gICAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICAgIEpvYnNTZXJ2aWNlLmdldE9wZXJhdG9yQmFja1ByZXNzdXJlKCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge30pO1xuICAgICAgcmV0dXJuICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzWyRzY29wZS5ub2RlaWRdID0gZGF0YTtcbiAgICB9XG4gIH07XG4gIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlKCk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdKb2JQbGFuQmFja1ByZXNzdXJlQ29udHJvbGxlciAocmVsb2FkKScpO1xuICAgIHJldHVybiBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgpO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYlRpbWVsaW5lVmVydGV4Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRWZXJ0ZXg7XG4gIGNvbnNvbGUubG9nKCdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInKTtcbiAgZ2V0VmVydGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldFZlcnRleCgkc3RhdGVQYXJhbXMudmVydGV4SWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS52ZXJ0ZXggPSBkYXRhO1xuICAgIH0pO1xuICB9O1xuICBnZXRWZXJ0ZXgoKTtcbiAgcmV0dXJuICRzY29wZS4kb24oJ3JlbG9hZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ0pvYlRpbWVsaW5lVmVydGV4Q29udHJvbGxlcicpO1xuICAgIHJldHVybiBnZXRWZXJ0ZXgoKTtcbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JFeGNlcHRpb25zQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gIHJldHVybiBKb2JzU2VydmljZS5sb2FkRXhjZXB0aW9ucygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiAkc2NvcGUuZXhjZXB0aW9ucyA9IGRhdGE7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUHJvcGVydGllc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIGNvbnNvbGUubG9nKCdKb2JQcm9wZXJ0aWVzQ29udHJvbGxlcicpO1xuICByZXR1cm4gJHNjb3BlLmNoYW5nZU5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICBpZiAobm9kZWlkICE9PSAkc2NvcGUubm9kZWlkKSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkO1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldE5vZGUobm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5ub2RlID0gZGF0YTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUubm9kZSA9IG51bGw7XG4gICAgfVxuICB9O1xufSkuY29udHJvbGxlcignSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UpIHtcbiAgdmFyIGxvYWRNZXRyaWNzO1xuICBjb25zb2xlLmxvZygnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJyk7XG4gICRzY29wZS5kcmFnZ2luZyA9IGZhbHNlO1xuICAkc2NvcGUud2luZG93ID0gTWV0cmljc1NlcnZpY2UuZ2V0V2luZG93KCk7XG4gICRzY29wZS5hdmFpbGFibGVNZXRyaWNzID0gbnVsbDtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCk7XG4gIH0pO1xuICBsb2FkTWV0cmljcyA9IGZ1bmN0aW9uKCkge1xuICAgIEpvYnNTZXJ2aWNlLmdldFZlcnRleCgkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUudmVydGV4ID0gZGF0YTtcbiAgICB9KTtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0QXZhaWxhYmxlTWV0cmljcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLmF2YWlsYWJsZU1ldHJpY3MgPSBkYXRhO1xuICAgICAgJHNjb3BlLm1ldHJpY3MgPSBNZXRyaWNzU2VydmljZS5nZXRNZXRyaWNzU2V0dXAoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkKS5uYW1lcztcbiAgICAgIHJldHVybiBNZXRyaWNzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLiRicm9hZGNhc3QoXCJtZXRyaWNzOmRhdGE6dXBkYXRlXCIsIGRhdGEudGltZXN0YW1wLCBkYXRhLnZhbHVlcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmRyb3BwZWQgPSBmdW5jdGlvbihldmVudCwgaW5kZXgsIGl0ZW0sIGV4dGVybmFsLCB0eXBlKSB7XG4gICAgTWV0cmljc1NlcnZpY2Uub3JkZXJNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgaXRlbSwgaW5kZXgpO1xuICAgICRzY29wZS4kYnJvYWRjYXN0KFwibWV0cmljczpyZWZyZXNoXCIsIGl0ZW0pO1xuICAgIGxvYWRNZXRyaWNzKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICAkc2NvcGUuZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5kcmFnZ2luZyA9IHRydWU7XG4gIH07XG4gICRzY29wZS5kcmFnRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5kcmFnZ2luZyA9IGZhbHNlO1xuICB9O1xuICAkc2NvcGUuYWRkTWV0cmljID0gZnVuY3Rpb24obWV0cmljKSB7XG4gICAgTWV0cmljc1NlcnZpY2UuYWRkTWV0cmljKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljLmlkKTtcbiAgICByZXR1cm4gbG9hZE1ldHJpY3MoKTtcbiAgfTtcbiAgJHNjb3BlLnJlbW92ZU1ldHJpYyA9IGZ1bmN0aW9uKG1ldHJpYykge1xuICAgIE1ldHJpY3NTZXJ2aWNlLnJlbW92ZU1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYyk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5zZXRNZXRyaWNTaXplID0gZnVuY3Rpb24obWV0cmljLCBzaXplKSB7XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljU2l6ZSgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgc2l6ZSk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbihtZXRyaWMpIHtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0VmFsdWVzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljKTtcbiAgfTtcbiAgJHNjb3BlLiRvbignbm9kZTpjaGFuZ2UnLCBmdW5jdGlvbihldmVudCwgbm9kZWlkKSB7XG4gICAgaWYgKCEkc2NvcGUuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybiBsb2FkTWV0cmljcygpO1xuICAgIH1cbiAgfSk7XG4gIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH1cbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICd2ZXJ0ZXgnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZSBzZWNvbmRhcnknIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiXG5cbiAgc2NvcGU6XG4gICAgZGF0YTogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICBhbmFseXplVGltZSA9IChkYXRhKSAtPlxuICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpXG5cbiAgICAgIHRlc3REYXRhID0gW11cblxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEuc3VidGFza3MsIChzdWJ0YXNrLCBpKSAtPlxuICAgICAgICB0aW1lcyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJTY2hlZHVsZWRcIlxuICAgICAgICAgICAgY29sb3I6IFwiIzY2NlwiXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCJcbiAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlNDSEVEVUxFRFwiXVxuICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIkRlcGxveWluZ1wiXG4gICAgICAgICAgICBjb2xvcjogXCIjYWFhXCJcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIlxuICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICBdXG5cbiAgICAgICAgaWYgc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0gPiAwXG4gICAgICAgICAgdGltZXMucHVzaCB7XG4gICAgICAgICAgICBsYWJlbDogXCJSdW5uaW5nXCJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNkZGRcIlxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiXG4gICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJSVU5OSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl1cbiAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgIH1cblxuICAgICAgICB0ZXN0RGF0YS5wdXNoIHtcbiAgICAgICAgICBsYWJlbDogXCIoI3tzdWJ0YXNrLnN1YnRhc2t9KSAje3N1YnRhc2suaG9zdH1cIlxuICAgICAgICAgIHRpbWVzOiB0aW1lc1xuICAgICAgICB9XG5cbiAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpXG4gICAgICAudGlja0Zvcm1hdCh7XG4gICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKVxuICAgICAgICAjIHRpY2tJbnRlcnZhbDogMVxuICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgfSlcbiAgICAgIC5wcmVmaXgoXCJzaW5nbGVcIilcbiAgICAgIC5sYWJlbEZvcm1hdCgobGFiZWwpIC0+XG4gICAgICAgIGxhYmVsXG4gICAgICApXG4gICAgICAubWFyZ2luKHsgbGVmdDogMTAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDAgfSlcbiAgICAgIC5pdGVtSGVpZ2h0KDMwKVxuICAgICAgLnJlbGF0aXZlVGltZSgpXG5cbiAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmdFbClcbiAgICAgIC5kYXR1bSh0ZXN0RGF0YSlcbiAgICAgIC5jYWxsKGNoYXJ0KVxuXG4gICAgYW5hbHl6ZVRpbWUoc2NvcGUuZGF0YSlcblxuICAgIHJldHVyblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAndGltZWxpbmUnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCJcblxuICBzY29wZTpcbiAgICB2ZXJ0aWNlczogXCI9XCJcbiAgICBqb2JpZDogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICB0cmFuc2xhdGVMYWJlbCA9IChsYWJlbCkgLT5cbiAgICAgIGxhYmVsLnJlcGxhY2UoXCImZ3Q7XCIsIFwiPlwiKVxuXG4gICAgYW5hbHl6ZVRpbWUgPSAoZGF0YSkgLT5cbiAgICAgIGQzLnNlbGVjdChzdmdFbCkuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKVxuXG4gICAgICB0ZXN0RGF0YSA9IFtdXG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLCAodmVydGV4KSAtPlxuICAgICAgICBpZiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSA+IC0xXG4gICAgICAgICAgaWYgdmVydGV4LnR5cGUgaXMgJ3NjaGVkdWxlZCdcbiAgICAgICAgICAgIHRlc3REYXRhLnB1c2ggXG4gICAgICAgICAgICAgIHRpbWVzOiBbXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZUxhYmVsKHZlcnRleC5uYW1lKVxuICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNjY2NjY2NcIlxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTU1NTVcIlxuICAgICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHZlcnRleFsnc3RhcnQtdGltZSddXG4gICAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHZlcnRleFsnZW5kLXRpbWUnXVxuICAgICAgICAgICAgICAgIHR5cGU6IHZlcnRleC50eXBlXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZXN0RGF0YS5wdXNoIFxuICAgICAgICAgICAgICB0aW1lczogW1xuICAgICAgICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVMYWJlbCh2ZXJ0ZXgubmFtZSlcbiAgICAgICAgICAgICAgICBjb2xvcjogXCIjZDlmMWY3XCJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNjJjZGVhXCJcbiAgICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXVxuICAgICAgICAgICAgICAgIGVuZGluZ190aW1lOiB2ZXJ0ZXhbJ2VuZC10aW1lJ11cbiAgICAgICAgICAgICAgICBsaW5rOiB2ZXJ0ZXguaWRcbiAgICAgICAgICAgICAgICB0eXBlOiB2ZXJ0ZXgudHlwZVxuICAgICAgICAgICAgICBdXG5cbiAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpLmNsaWNrKChkLCBpLCBkYXR1bSkgLT5cbiAgICAgICAgaWYgZC5saW5rXG4gICAgICAgICAgJHN0YXRlLmdvIFwic2luZ2xlLWpvYi50aW1lbGluZS52ZXJ0ZXhcIiwgeyBqb2JpZDogc2NvcGUuam9iaWQsIHZlcnRleElkOiBkLmxpbmsgfVxuXG4gICAgICApXG4gICAgICAudGlja0Zvcm1hdCh7XG4gICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKVxuICAgICAgICAjIHRpY2tUaW1lOiBkMy50aW1lLnNlY29uZFxuICAgICAgICAjIHRpY2tJbnRlcnZhbDogMC41XG4gICAgICAgIHRpY2tTaXplOiAxXG4gICAgICB9KVxuICAgICAgLnByZWZpeChcIm1haW5cIilcbiAgICAgIC5tYXJnaW4oeyBsZWZ0OiAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDAgfSlcbiAgICAgIC5pdGVtSGVpZ2h0KDMwKVxuICAgICAgLnNob3dCb3JkZXJMaW5lKClcbiAgICAgIC5zaG93SG91clRpbWVsaW5lKClcblxuICAgICAgc3ZnID0gZDMuc2VsZWN0KHN2Z0VsKVxuICAgICAgLmRhdHVtKHRlc3REYXRhKVxuICAgICAgLmNhbGwoY2hhcnQpXG5cbiAgICBzY29wZS4kd2F0Y2ggYXR0cnMudmVydGljZXMsIChkYXRhKSAtPlxuICAgICAgYW5hbHl6ZVRpbWUoZGF0YSkgaWYgZGF0YVxuXG4gICAgcmV0dXJuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdqb2JQbGFuJywgKCR0aW1lb3V0KSAtPlxuICB0ZW1wbGF0ZTogXCJcbiAgICA8c3ZnIGNsYXNzPSdncmFwaCcgd2lkdGg9JzUwMCcgaGVpZ2h0PSc0MDAnPjxnIC8+PC9zdmc+XG4gICAgPHN2ZyBjbGFzcz0ndG1wJyB3aWR0aD0nMScgaGVpZ2h0PScxJz48ZyAvPjwvc3ZnPlxuICAgIDxkaXYgY2xhc3M9J2J0bi1ncm91cCB6b29tLWJ1dHRvbnMnPlxuICAgICAgPGEgY2xhc3M9J2J0biBidG4tZGVmYXVsdCB6b29tLWluJyBuZy1jbGljaz0nem9vbUluKCknPjxpIGNsYXNzPSdmYSBmYS1wbHVzJyAvPjwvYT5cbiAgICAgIDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQgem9vbS1vdXQnIG5nLWNsaWNrPSd6b29tT3V0KCknPjxpIGNsYXNzPSdmYSBmYS1taW51cycgLz48L2E+XG4gICAgPC9kaXY+XCJcblxuICBzY29wZTpcbiAgICBwbGFuOiAnPSdcbiAgICBzZXROb2RlOiAnJidcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIGcgPSBudWxsXG4gICAgbWFpblpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICBzdWJncmFwaHMgPSBbXVxuICAgIGpvYmlkID0gYXR0cnMuam9iaWRcblxuICAgIG1haW5TdmdFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzBdXG4gICAgbWFpbkcgPSBlbGVtLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVswXVxuICAgIG1haW5UbXBFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzFdXG5cbiAgICBkM21haW5TdmcgPSBkMy5zZWxlY3QobWFpblN2Z0VsZW1lbnQpXG4gICAgZDNtYWluU3ZnRyA9IGQzLnNlbGVjdChtYWluRylcbiAgICBkM3RtcFN2ZyA9IGQzLnNlbGVjdChtYWluVG1wRWxlbWVudClcblxuICAgICMgYW5ndWxhci5lbGVtZW50KG1haW5HKS5lbXB0eSgpXG4gICAgIyBkM21haW5TdmdHLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKClcblxuICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKClcbiAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbS5jaGlsZHJlbigpWzBdKS53aWR0aChjb250YWluZXJXKVxuXG4gICAgc2NvcGUuem9vbUluID0gLT5cbiAgICAgIGlmIG1haW5ab29tLnNjYWxlKCkgPCAyLjk5XG4gICAgICAgIFxuICAgICAgICAjIENhbGN1bGF0ZSBhbmQgc3RvcmUgbmV3IHZhbHVlcyBpbiB6b29tIG9iamVjdFxuICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpICsgMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpICsgMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICBtYWluWm9vbS5zY2FsZSBtYWluWm9vbS5zY2FsZSgpICsgMC4xXG4gICAgICAgIG1haW5ab29tLnRyYW5zbGF0ZSBbIHYxLCB2MiBdXG4gICAgICAgIFxuICAgICAgICAjIFRyYW5zZm9ybSBzdmdcbiAgICAgICAgZDNtYWluU3ZnRy5hdHRyIFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiXG5cbiAgICBzY29wZS56b29tT3V0ID0gLT5cbiAgICAgIGlmIG1haW5ab29tLnNjYWxlKCkgPiAwLjMxXG4gICAgICAgIFxuICAgICAgICAjIENhbGN1bGF0ZSBhbmQgc3RvcmUgbmV3IHZhbHVlcyBpbiBtYWluWm9vbSBvYmplY3RcbiAgICAgICAgbWFpblpvb20uc2NhbGUgbWFpblpvb20uc2NhbGUoKSAtIDAuMVxuICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUgWyB2MSwgdjIgXVxuICAgICAgICBcbiAgICAgICAgIyBUcmFuc2Zvcm0gc3ZnXG4gICAgICAgIGQzbWFpblN2Z0cuYXR0ciBcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHYxICsgXCIsXCIgKyB2MiArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIlxuXG4gICAgI2NyZWF0ZSBhIGxhYmVsIG9mIGFuIGVkZ2VcbiAgICBjcmVhdGVMYWJlbEVkZ2UgPSAoZWwpIC0+XG4gICAgICBsYWJlbFZhbHVlID0gXCJcIlxuICAgICAgaWYgZWwuc2hpcF9zdHJhdGVneT8gb3IgZWwubG9jYWxfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8ZGl2IGNsYXNzPSdlZGdlLWxhYmVsJz5cIlxuICAgICAgICBsYWJlbFZhbHVlICs9IGVsLnNoaXBfc3RyYXRlZ3kgIGlmIGVsLnNoaXBfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCIgKFwiICsgZWwudGVtcF9tb2RlICsgXCIpXCIgIHVubGVzcyBlbC50ZW1wX21vZGUgaXMgYHVuZGVmaW5lZGBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneSAgdW5sZXNzIGVsLmxvY2FsX3N0cmF0ZWd5IGlzIGB1bmRlZmluZWRgXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8L2Rpdj5cIlxuICAgICAgbGFiZWxWYWx1ZVxuXG5cbiAgICAjIHRydWUsIGlmIHRoZSBub2RlIGlzIGEgc3BlY2lhbCBub2RlIGZyb20gYW4gaXRlcmF0aW9uXG4gICAgaXNTcGVjaWFsSXRlcmF0aW9uTm9kZSA9IChpbmZvKSAtPlxuICAgICAgKGluZm8gaXMgXCJwYXJ0aWFsU29sdXRpb25cIiBvciBpbmZvIGlzIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIG9yIGluZm8gaXMgXCJ3b3Jrc2V0XCIgb3IgaW5mbyBpcyBcIm5leHRXb3Jrc2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uU2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uRGVsdGFcIilcblxuICAgIGdldE5vZGVUeXBlID0gKGVsLCBpbmZvKSAtPlxuICAgICAgaWYgaW5mbyBpcyBcIm1pcnJvclwiXG4gICAgICAgICdub2RlLW1pcnJvcidcblxuICAgICAgZWxzZSBpZiBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pXG4gICAgICAgICdub2RlLWl0ZXJhdGlvbidcblxuICAgICAgZWxzZVxuICAgICAgICAgICdub2RlLW5vcm1hbCdcbiAgICAgIFxuICAgICMgY3JlYXRlcyB0aGUgbGFiZWwgb2YgYSBub2RlLCBpbiBpbmZvIGlzIHN0b3JlZCwgd2hldGhlciBpdCBpcyBhIHNwZWNpYWwgbm9kZSAobGlrZSBhIG1pcnJvciBpbiBhbiBpdGVyYXRpb24pXG4gICAgY3JlYXRlTGFiZWxOb2RlID0gKGVsLCBpbmZvLCBtYXhXLCBtYXhIKSAtPlxuICAgICAgIyBsYWJlbFZhbHVlID0gXCI8YSBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiXG4gICAgICBsYWJlbFZhbHVlID0gXCI8ZGl2IGhyZWY9JyMvam9icy9cIiArIGpvYmlkICsgXCIvdmVydGV4L1wiICsgZWwuaWQgKyBcIicgY2xhc3M9J25vZGUtbGFiZWwgXCIgKyBnZXROb2RlVHlwZShlbCwgaW5mbykgKyBcIic+XCJcblxuICAgICAgIyBOb2RlbmFtZVxuICAgICAgaWYgaW5mbyBpcyBcIm1pcnJvclwiXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+TWlycm9yIG9mIFwiICsgZWwub3BlcmF0b3IgKyBcIjwvaDM+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoMyBjbGFzcz0nbm9kZS1uYW1lJz5cIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiXG4gICAgICBpZiBlbC5kZXNjcmlwdGlvbiBpcyBcIlwiXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCJcIlxuICAgICAgZWxzZVxuICAgICAgICBzdGVwTmFtZSA9IGVsLmRlc2NyaXB0aW9uXG4gICAgICAgIFxuICAgICAgICAjIGNsZWFuIHN0ZXBOYW1lXG4gICAgICAgIHN0ZXBOYW1lID0gc2hvcnRlblN0cmluZyhzdGVwTmFtZSlcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNCBjbGFzcz0nc3RlcC1uYW1lJz5cIiArIHN0ZXBOYW1lICsgXCI8L2g0PlwiXG4gICAgICBcbiAgICAgICMgSWYgdGhpcyBub2RlIGlzIGFuIFwiaXRlcmF0aW9uXCIgd2UgbmVlZCBhIGRpZmZlcmVudCBwYW5lbC1ib2R5XG4gICAgICBpZiBlbC5zdGVwX2Z1bmN0aW9uP1xuICAgICAgICBsYWJlbFZhbHVlICs9IGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbihlbC5pZCwgbWF4VywgbWF4SClcbiAgICAgIGVsc2VcbiAgICAgICAgXG4gICAgICAgICMgT3RoZXJ3aXNlIGFkZCBpbmZvcyAgICBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5cIiArIGluZm8gKyBcIiBOb2RlPC9oNT5cIiAgaWYgaXNTcGVjaWFsSXRlcmF0aW9uTm9kZShpbmZvKVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1PlBhcmFsbGVsaXNtOiBcIiArIGVsLnBhcmFsbGVsaXNtICsgXCI8L2g1PlwiICB1bmxlc3MgZWwucGFyYWxsZWxpc20gaXMgXCJcIlxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1Pk9wZXJhdGlvbjogXCIgKyBzaG9ydGVuU3RyaW5nKGVsLm9wZXJhdG9yX3N0cmF0ZWd5KSArIFwiPC9oNT5cIiAgdW5sZXNzIGVsLm9wZXJhdG9yIGlzIGB1bmRlZmluZWRgXG4gICAgICBcbiAgICAgICMgbGFiZWxWYWx1ZSArPSBcIjwvYT5cIlxuICAgICAgbGFiZWxWYWx1ZSArPSBcIjwvZGl2PlwiXG4gICAgICBsYWJlbFZhbHVlXG5cbiAgICAjIEV4dGVuZHMgdGhlIGxhYmVsIG9mIGEgbm9kZSB3aXRoIGFuIGFkZGl0aW9uYWwgc3ZnIEVsZW1lbnQgdG8gcHJlc2VudCB0aGUgaXRlcmF0aW9uLlxuICAgIGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbiA9IChpZCwgbWF4VywgbWF4SCkgLT5cbiAgICAgIHN2Z0lEID0gXCJzdmctXCIgKyBpZFxuXG4gICAgICBsYWJlbFZhbHVlID0gXCI8c3ZnIGNsYXNzPSdcIiArIHN2Z0lEICsgXCInIHdpZHRoPVwiICsgbWF4VyArIFwiIGhlaWdodD1cIiArIG1heEggKyBcIj48ZyAvPjwvc3ZnPlwiXG4gICAgICBsYWJlbFZhbHVlXG5cbiAgICAjIFNwbGl0IGEgc3RyaW5nIGludG8gbXVsdGlwbGUgbGluZXMgc28gdGhhdCBlYWNoIGxpbmUgaGFzIGxlc3MgdGhhbiAzMCBsZXR0ZXJzLlxuICAgIHNob3J0ZW5TdHJpbmcgPSAocykgLT5cbiAgICAgICMgbWFrZSBzdXJlIHRoYXQgbmFtZSBkb2VzIG5vdCBjb250YWluIGEgPCAoYmVjYXVzZSBvZiBodG1sKVxuICAgICAgaWYgcy5jaGFyQXQoMCkgaXMgXCI8XCJcbiAgICAgICAgcyA9IHMucmVwbGFjZShcIjxcIiwgXCImbHQ7XCIpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoXCI+XCIsIFwiJmd0O1wiKVxuICAgICAgc2JyID0gXCJcIlxuICAgICAgd2hpbGUgcy5sZW5ndGggPiAzMFxuICAgICAgICBzYnIgPSBzYnIgKyBzLnN1YnN0cmluZygwLCAzMCkgKyBcIjxicj5cIlxuICAgICAgICBzID0gcy5zdWJzdHJpbmcoMzAsIHMubGVuZ3RoKVxuICAgICAgc2JyID0gc2JyICsgc1xuICAgICAgc2JyXG5cbiAgICBjcmVhdGVOb2RlID0gKGcsIGRhdGEsIGVsLCBpc1BhcmVudCA9IGZhbHNlLCBtYXhXLCBtYXhIKSAtPlxuICAgICAgIyBjcmVhdGUgbm9kZSwgc2VuZCBhZGRpdGlvbmFsIGluZm9ybWF0aW9ucyBhYm91dCB0aGUgbm9kZSBpZiBpdCBpcyBhIHNwZWNpYWwgb25lXG4gICAgICBpZiBlbC5pZCBpcyBkYXRhLnBhcnRpYWxfc29sdXRpb25cbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwicGFydGlhbFNvbHV0aW9uXCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwicGFydGlhbFNvbHV0aW9uXCIpXG5cbiAgICAgIGVsc2UgaWYgZWwuaWQgaXMgZGF0YS5uZXh0X3BhcnRpYWxfc29sdXRpb25cbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIm5leHRQYXJ0aWFsU29sdXRpb25cIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLndvcmtzZXRcbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwid29ya3NldFwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIndvcmtzZXRcIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLm5leHRfd29ya3NldFxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJuZXh0V29ya3NldFwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIm5leHRXb3Jrc2V0XCIpXG5cbiAgICAgIGVsc2UgaWYgZWwuaWQgaXMgZGF0YS5zb2x1dGlvbl9zZXRcbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwic29sdXRpb25TZXRcIiwgbWF4VywgbWF4SClcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICAgIGNsYXNzOiBnZXROb2RlVHlwZShlbCwgXCJzb2x1dGlvblNldFwiKVxuXG4gICAgICBlbHNlIGlmIGVsLmlkIGlzIGRhdGEuc29sdXRpb25fZGVsdGFcbiAgICAgICAgZy5zZXROb2RlIGVsLmlkLFxuICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwic29sdXRpb25EZWx0YVwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uRGVsdGFcIilcblxuICAgICAgZWxzZVxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJcIiwgbWF4VywgbWF4SClcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICAgIGNsYXNzOiBnZXROb2RlVHlwZShlbCwgXCJcIilcblxuICAgIGNyZWF0ZUVkZ2UgPSAoZywgZGF0YSwgZWwsIGV4aXN0aW5nTm9kZXMsIHByZWQpIC0+XG4gICAgICB1bmxlc3MgZXhpc3RpbmdOb2Rlcy5pbmRleE9mKHByZWQuaWQpIGlzIC0xXG4gICAgICAgIGcuc2V0RWRnZSBwcmVkLmlkLCBlbC5pZCxcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKHByZWQpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG5cbiAgICAgIGVsc2VcbiAgICAgICAgbWlzc2luZ05vZGUgPSBzZWFyY2hGb3JOb2RlKGRhdGEsIHByZWQuaWQpXG4gICAgICAgIHVubGVzcyAhbWlzc2luZ05vZGVcbiAgICAgICAgICBnLnNldEVkZ2UgbWlzc2luZ05vZGUuaWQsIGVsLmlkLFxuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsRWRnZShtaXNzaW5nTm9kZSlcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG5cbiAgICBsb2FkSnNvblRvRGFncmUgPSAoZywgZGF0YSkgLT5cbiAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXVxuXG4gICAgICBpZiBkYXRhLm5vZGVzP1xuICAgICAgICAjIFRoaXMgaXMgdGhlIG5vcm1hbCBqc29uIGRhdGFcbiAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5ub2Rlc1xuXG4gICAgICBlbHNlXG4gICAgICAgICMgVGhpcyBpcyBhbiBpdGVyYXRpb24sIHdlIG5vdyBzdG9yZSBzcGVjaWFsIGl0ZXJhdGlvbiBub2RlcyBpZiBwb3NzaWJsZVxuICAgICAgICB0b0l0ZXJhdGUgPSBkYXRhLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgaXNQYXJlbnQgPSB0cnVlXG5cbiAgICAgIGZvciBlbCBpbiB0b0l0ZXJhdGVcbiAgICAgICAgbWF4VyA9IDBcbiAgICAgICAgbWF4SCA9IDBcblxuICAgICAgICBpZiBlbC5zdGVwX2Z1bmN0aW9uXG4gICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICAgIG5vZGVzZXA6IDIwXG4gICAgICAgICAgICBlZGdlc2VwOiAwXG4gICAgICAgICAgICByYW5rc2VwOiAyMFxuICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiXG4gICAgICAgICAgICBtYXJnaW54OiAxMFxuICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICBzdWJncmFwaHNbZWwuaWRdID0gc2dcblxuICAgICAgICAgIGxvYWRKc29uVG9EYWdyZShzZywgZWwpXG5cbiAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKClcbiAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKVxuICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoXG4gICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0XG5cbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQobWFpblRtcEVsZW1lbnQpLmVtcHR5KClcblxuICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SClcblxuICAgICAgICBleGlzdGluZ05vZGVzLnB1c2ggZWwuaWRcbiAgICAgICAgXG4gICAgICAgICMgY3JlYXRlIGVkZ2VzIGZyb20gaW5wdXRzIHRvIGN1cnJlbnQgbm9kZVxuICAgICAgICBpZiBlbC5pbnB1dHM/XG4gICAgICAgICAgZm9yIHByZWQgaW4gZWwuaW5wdXRzXG4gICAgICAgICAgICBjcmVhdGVFZGdlKGcsIGRhdGEsIGVsLCBleGlzdGluZ05vZGVzLCBwcmVkKVxuXG4gICAgICBnXG5cbiAgICAjIHNlYXJjaGVzIGluIHRoZSBnbG9iYWwgSlNPTkRhdGEgZm9yIHRoZSBub2RlIHdpdGggdGhlIGdpdmVuIGlkXG4gICAgc2VhcmNoRm9yTm9kZSA9IChkYXRhLCBub2RlSUQpIC0+XG4gICAgICBmb3IgaSBvZiBkYXRhLm5vZGVzXG4gICAgICAgIGVsID0gZGF0YS5ub2Rlc1tpXVxuICAgICAgICByZXR1cm4gZWwgIGlmIGVsLmlkIGlzIG5vZGVJRFxuICAgICAgICBcbiAgICAgICAgIyBsb29rIGZvciBub2RlcyB0aGF0IGFyZSBpbiBpdGVyYXRpb25zXG4gICAgICAgIGlmIGVsLnN0ZXBfZnVuY3Rpb24/XG4gICAgICAgICAgZm9yIGogb2YgZWwuc3RlcF9mdW5jdGlvblxuICAgICAgICAgICAgcmV0dXJuIGVsLnN0ZXBfZnVuY3Rpb25bal0gIGlmIGVsLnN0ZXBfZnVuY3Rpb25bal0uaWQgaXMgbm9kZUlEXG5cbiAgICBkcmF3R3JhcGggPSAoZGF0YSkgLT5cbiAgICAgIGcgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pLnNldEdyYXBoKHtcbiAgICAgICAgbm9kZXNlcDogNzBcbiAgICAgICAgZWRnZXNlcDogMFxuICAgICAgICByYW5rc2VwOiA1MFxuICAgICAgICByYW5rZGlyOiBcIkxSXCJcbiAgICAgICAgbWFyZ2lueDogNDBcbiAgICAgICAgbWFyZ2lueTogNDBcbiAgICAgICAgfSlcblxuICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIGRhdGEpXG5cbiAgICAgIHJlbmRlcmVyID0gbmV3IGRhZ3JlRDMucmVuZGVyKClcbiAgICAgIGQzbWFpblN2Z0cuY2FsbChyZW5kZXJlciwgZylcblxuICAgICAgZm9yIGksIHNnIG9mIHN1YmdyYXBoc1xuICAgICAgICBkM21haW5Tdmcuc2VsZWN0KCdzdmcuc3ZnLScgKyBpICsgJyBnJykuY2FsbChyZW5kZXJlciwgc2cpXG5cbiAgICAgIG5ld1NjYWxlID0gMC41XG5cbiAgICAgIHhDZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKChhbmd1bGFyLmVsZW1lbnQobWFpblN2Z0VsZW1lbnQpLndpZHRoKCkgLSBnLmdyYXBoKCkud2lkdGggKiBuZXdTY2FsZSkgLyAyKVxuICAgICAgeUNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkuaGVpZ2h0KCkgLSBnLmdyYXBoKCkuaGVpZ2h0ICogbmV3U2NhbGUpIC8gMilcblxuICAgICAgbWFpblpvb20uc2NhbGUobmV3U2NhbGUpLnRyYW5zbGF0ZShbeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldF0pXG5cbiAgICAgIGQzbWFpblN2Z0cuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHhDZW50ZXJPZmZzZXQgKyBcIiwgXCIgKyB5Q2VudGVyT2Zmc2V0ICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiKVxuXG4gICAgICBtYWluWm9vbS5vbihcInpvb21cIiwgLT5cbiAgICAgICAgZXYgPSBkMy5ldmVudFxuICAgICAgICBkM21haW5TdmdHLmF0dHIgXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBldi50cmFuc2xhdGUgKyBcIikgc2NhbGUoXCIgKyBldi5zY2FsZSArIFwiKVwiXG4gICAgICApXG4gICAgICBtYWluWm9vbShkM21haW5TdmcpXG5cbiAgICAgIGQzbWFpblN2Z0cuc2VsZWN0QWxsKCcubm9kZScpLm9uICdjbGljaycsIChkKSAtPlxuICAgICAgICBzY29wZS5zZXROb2RlKHsgbm9kZWlkOiBkIH0pXG5cbiAgICBzY29wZS4kd2F0Y2ggYXR0cnMucGxhbiwgKG5ld1BsYW4pIC0+XG4gICAgICBkcmF3R3JhcGgobmV3UGxhbikgaWYgbmV3UGxhblxuXG4gICAgcmV0dXJuXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5kaXJlY3RpdmUoJ3ZlcnRleCcsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBcIjxzdmcgY2xhc3M9J3RpbWVsaW5lIHNlY29uZGFyeScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIGRhdGE6IFwiPVwiXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBhbmFseXplVGltZSwgY29udGFpbmVyVywgc3ZnRWw7XG4gICAgICBzdmdFbCA9IGVsZW0uY2hpbGRyZW4oKVswXTtcbiAgICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKCk7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoc3ZnRWwpLmF0dHIoJ3dpZHRoJywgY29udGFpbmVyVyk7XG4gICAgICBhbmFseXplVGltZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGNoYXJ0LCBzdmcsIHRlc3REYXRhO1xuICAgICAgICBkMy5zZWxlY3Qoc3ZnRWwpLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XG4gICAgICAgIHRlc3REYXRhID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLnN1YnRhc2tzLCBmdW5jdGlvbihzdWJ0YXNrLCBpKSB7XG4gICAgICAgICAgdmFyIHRpbWVzO1xuICAgICAgICAgIHRpbWVzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsYWJlbDogXCJTY2hlZHVsZWRcIixcbiAgICAgICAgICAgICAgY29sb3I6IFwiIzY2NlwiLFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCIsXG4gICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlNDSEVEVUxFRFwiXSxcbiAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXSxcbiAgICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkRlcGxveWluZ1wiLFxuICAgICAgICAgICAgICBjb2xvcjogXCIjYWFhXCIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIixcbiAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdLFxuICAgICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXSxcbiAgICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXTtcbiAgICAgICAgICBpZiAoc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0gPiAwKSB7XG4gICAgICAgICAgICB0aW1lcy5wdXNoKHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiUnVubmluZ1wiLFxuICAgICAgICAgICAgICBjb2xvcjogXCIjZGRkXCIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIixcbiAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXSxcbiAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkZJTklTSEVEXCJdLFxuICAgICAgICAgICAgICB0eXBlOiAncmVndWxhcidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGVzdERhdGEucHVzaCh7XG4gICAgICAgICAgICBsYWJlbDogXCIoXCIgKyBzdWJ0YXNrLnN1YnRhc2sgKyBcIikgXCIgKyBzdWJ0YXNrLmhvc3QsXG4gICAgICAgICAgICB0aW1lczogdGltZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpLnRpY2tGb3JtYXQoe1xuICAgICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKSxcbiAgICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgICB9KS5wcmVmaXgoXCJzaW5nbGVcIikubGFiZWxGb3JtYXQoZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgIH0pLm1hcmdpbih7XG4gICAgICAgICAgbGVmdDogMTAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgfSkuaXRlbUhlaWdodCgzMCkucmVsYXRpdmVUaW1lKCk7XG4gICAgICAgIHJldHVybiBzdmcgPSBkMy5zZWxlY3Qoc3ZnRWwpLmRhdHVtKHRlc3REYXRhKS5jYWxsKGNoYXJ0KTtcbiAgICAgIH07XG4gICAgICBhbmFseXplVGltZShzY29wZS5kYXRhKTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ3RpbWVsaW5lJywgZnVuY3Rpb24oJHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6IFwiPHN2ZyBjbGFzcz0ndGltZWxpbmUnIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiLFxuICAgIHNjb3BlOiB7XG4gICAgICB2ZXJ0aWNlczogXCI9XCIsXG4gICAgICBqb2JpZDogXCI9XCJcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xuICAgICAgdmFyIGFuYWx5emVUaW1lLCBjb250YWluZXJXLCBzdmdFbCwgdHJhbnNsYXRlTGFiZWw7XG4gICAgICBzdmdFbCA9IGVsZW0uY2hpbGRyZW4oKVswXTtcbiAgICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKCk7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoc3ZnRWwpLmF0dHIoJ3dpZHRoJywgY29udGFpbmVyVyk7XG4gICAgICB0cmFuc2xhdGVMYWJlbCA9IGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgIHJldHVybiBsYWJlbC5yZXBsYWNlKFwiJmd0O1wiLCBcIj5cIik7XG4gICAgICB9O1xuICAgICAgYW5hbHl6ZVRpbWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBjaGFydCwgc3ZnLCB0ZXN0RGF0YTtcbiAgICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICAgICAgICB0ZXN0RGF0YSA9IFtdO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmVydGV4KSB7XG4gICAgICAgICAgaWYgKHZlcnRleFsnc3RhcnQtdGltZSddID4gLTEpIHtcbiAgICAgICAgICAgIGlmICh2ZXJ0ZXgudHlwZSA9PT0gJ3NjaGVkdWxlZCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRlc3REYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIHRpbWVzOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVMYWJlbCh2ZXJ0ZXgubmFtZSksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNjY2NjY2NcIixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NTU1NVwiLFxuICAgICAgICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHZlcnRleFsnZW5kLXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRlc3REYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIHRpbWVzOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0cmFuc2xhdGVMYWJlbCh2ZXJ0ZXgubmFtZSksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNkOWYxZjdcIixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzYyY2RlYVwiLFxuICAgICAgICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHZlcnRleFsnZW5kLXRpbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgbGluazogdmVydGV4LmlkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB2ZXJ0ZXgudHlwZVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2hhcnQgPSBkMy50aW1lbGluZSgpLnN0YWNrKCkuY2xpY2soZnVuY3Rpb24oZCwgaSwgZGF0dW0pIHtcbiAgICAgICAgICBpZiAoZC5saW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gJHN0YXRlLmdvKFwic2luZ2xlLWpvYi50aW1lbGluZS52ZXJ0ZXhcIiwge1xuICAgICAgICAgICAgICBqb2JpZDogc2NvcGUuam9iaWQsXG4gICAgICAgICAgICAgIHZlcnRleElkOiBkLmxpbmtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkudGlja0Zvcm1hdCh7XG4gICAgICAgICAgZm9ybWF0OiBkMy50aW1lLmZvcm1hdChcIiVMXCIpLFxuICAgICAgICAgIHRpY2tTaXplOiAxXG4gICAgICAgIH0pLnByZWZpeChcIm1haW5cIikubWFyZ2luKHtcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgfSkuaXRlbUhlaWdodCgzMCkuc2hvd0JvcmRlckxpbmUoKS5zaG93SG91clRpbWVsaW5lKCk7XG4gICAgICAgIHJldHVybiBzdmcgPSBkMy5zZWxlY3Qoc3ZnRWwpLmRhdHVtKHRlc3REYXRhKS5jYWxsKGNoYXJ0KTtcbiAgICAgIH07XG4gICAgICBzY29wZS4kd2F0Y2goYXR0cnMudmVydGljZXMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gYW5hbHl6ZVRpbWUoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnam9iUGxhbicsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6IFwiPHN2ZyBjbGFzcz0nZ3JhcGgnIHdpZHRoPSc1MDAnIGhlaWdodD0nNDAwJz48ZyAvPjwvc3ZnPiA8c3ZnIGNsYXNzPSd0bXAnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxnIC8+PC9zdmc+IDxkaXYgY2xhc3M9J2J0bi1ncm91cCB6b29tLWJ1dHRvbnMnPiA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20taW4nIG5nLWNsaWNrPSd6b29tSW4oKSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMnIC8+PC9hPiA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20tb3V0JyBuZy1jbGljaz0nem9vbU91dCgpJz48aSBjbGFzcz0nZmEgZmEtbWludXMnIC8+PC9hPiA8L2Rpdj5cIixcbiAgICBzY29wZToge1xuICAgICAgcGxhbjogJz0nLFxuICAgICAgc2V0Tm9kZTogJyYnXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBjb250YWluZXJXLCBjcmVhdGVFZGdlLCBjcmVhdGVMYWJlbEVkZ2UsIGNyZWF0ZUxhYmVsTm9kZSwgY3JlYXRlTm9kZSwgZDNtYWluU3ZnLCBkM21haW5TdmdHLCBkM3RtcFN2ZywgZHJhd0dyYXBoLCBleHRlbmRMYWJlbE5vZGVGb3JJdGVyYXRpb24sIGcsIGdldE5vZGVUeXBlLCBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlLCBqb2JpZCwgbG9hZEpzb25Ub0RhZ3JlLCBtYWluRywgbWFpblN2Z0VsZW1lbnQsIG1haW5UbXBFbGVtZW50LCBtYWluWm9vbSwgc2VhcmNoRm9yTm9kZSwgc2hvcnRlblN0cmluZywgc3ViZ3JhcGhzO1xuICAgICAgZyA9IG51bGw7XG4gICAgICBtYWluWm9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKTtcbiAgICAgIHN1YmdyYXBocyA9IFtdO1xuICAgICAgam9iaWQgPSBhdHRycy5qb2JpZDtcbiAgICAgIG1haW5TdmdFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzBdO1xuICAgICAgbWFpbkcgPSBlbGVtLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVswXTtcbiAgICAgIG1haW5UbXBFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzFdO1xuICAgICAgZDNtYWluU3ZnID0gZDMuc2VsZWN0KG1haW5TdmdFbGVtZW50KTtcbiAgICAgIGQzbWFpblN2Z0cgPSBkMy5zZWxlY3QobWFpbkcpO1xuICAgICAgZDN0bXBTdmcgPSBkMy5zZWxlY3QobWFpblRtcEVsZW1lbnQpO1xuICAgICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtLmNoaWxkcmVuKClbMF0pLndpZHRoKGNvbnRhaW5lclcpO1xuICAgICAgc2NvcGUuem9vbUluID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0cmFuc2xhdGUsIHYxLCB2MjtcbiAgICAgICAgaWYgKG1haW5ab29tLnNjYWxlKCkgPCAyLjk5KSB7XG4gICAgICAgICAgdHJhbnNsYXRlID0gbWFpblpvb20udHJhbnNsYXRlKCk7XG4gICAgICAgICAgdjEgPSB0cmFuc2xhdGVbMF0gKiAobWFpblpvb20uc2NhbGUoKSArIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgdjIgPSB0cmFuc2xhdGVbMV0gKiAobWFpblpvb20uc2NhbGUoKSArIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgbWFpblpvb20uc2NhbGUobWFpblpvb20uc2NhbGUoKSArIDAuMSk7XG4gICAgICAgICAgbWFpblpvb20udHJhbnNsYXRlKFt2MSwgdjJdKTtcbiAgICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLnpvb21PdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZSwgdjEsIHYyO1xuICAgICAgICBpZiAobWFpblpvb20uc2NhbGUoKSA+IDAuMzEpIHtcbiAgICAgICAgICBtYWluWm9vbS5zY2FsZShtYWluWm9vbS5zY2FsZSgpIC0gMC4xKTtcbiAgICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKTtcbiAgICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKTtcbiAgICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKTtcbiAgICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUoW3YxLCB2Ml0pO1xuICAgICAgICAgIHJldHVybiBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB2MSArIFwiLFwiICsgdjIgKyBcIikgc2NhbGUoXCIgKyBtYWluWm9vbS5zY2FsZSgpICsgXCIpXCIpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY3JlYXRlTGFiZWxFZGdlID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGxhYmVsVmFsdWU7XG4gICAgICAgIGxhYmVsVmFsdWUgPSBcIlwiO1xuICAgICAgICBpZiAoKGVsLnNoaXBfc3RyYXRlZ3kgIT0gbnVsbCkgfHwgKGVsLmxvY2FsX3N0cmF0ZWd5ICE9IG51bGwpKSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxkaXYgY2xhc3M9J2VkZ2UtbGFiZWwnPlwiO1xuICAgICAgICAgIGlmIChlbC5zaGlwX3N0cmF0ZWd5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gZWwuc2hpcF9zdHJhdGVneTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLnRlbXBfbW9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiIChcIiArIGVsLnRlbXBfbW9kZSArIFwiKVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWwubG9jYWxfc3RyYXRlZ3kgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjwvZGl2PlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYWJlbFZhbHVlO1xuICAgICAgfTtcbiAgICAgIGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUgPSBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHJldHVybiBpbmZvID09PSBcInBhcnRpYWxTb2x1dGlvblwiIHx8IGluZm8gPT09IFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIHx8IGluZm8gPT09IFwid29ya3NldFwiIHx8IGluZm8gPT09IFwibmV4dFdvcmtzZXRcIiB8fCBpbmZvID09PSBcInNvbHV0aW9uU2V0XCIgfHwgaW5mbyA9PT0gXCJzb2x1dGlvbkRlbHRhXCI7XG4gICAgICB9O1xuICAgICAgZ2V0Tm9kZVR5cGUgPSBmdW5jdGlvbihlbCwgaW5mbykge1xuICAgICAgICBpZiAoaW5mbyA9PT0gXCJtaXJyb3JcIikge1xuICAgICAgICAgIHJldHVybiAnbm9kZS1taXJyb3InO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUoaW5mbykpIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtaXRlcmF0aW9uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtbm9ybWFsJztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNyZWF0ZUxhYmVsTm9kZSA9IGZ1bmN0aW9uKGVsLCBpbmZvLCBtYXhXLCBtYXhIKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlLCBzdGVwTmFtZTtcbiAgICAgICAgbGFiZWxWYWx1ZSA9IFwiPGRpdiBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiO1xuICAgICAgICBpZiAoaW5mbyA9PT0gXCJtaXJyb3JcIikge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+TWlycm9yIG9mIFwiICsgZWwub3BlcmF0b3IgKyBcIjwvaDM+XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoMyBjbGFzcz0nbm9kZS1uYW1lJz5cIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5kZXNjcmlwdGlvbiA9PT0gXCJcIikge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCJcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGVwTmFtZSA9IGVsLmRlc2NyaXB0aW9uO1xuICAgICAgICAgIHN0ZXBOYW1lID0gc2hvcnRlblN0cmluZyhzdGVwTmFtZSk7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNCBjbGFzcz0nc3RlcC1uYW1lJz5cIiArIHN0ZXBOYW1lICsgXCI8L2g0PlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5zdGVwX2Z1bmN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICBsYWJlbFZhbHVlICs9IGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbihlbC5pZCwgbWF4VywgbWF4SCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUoaW5mbykpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+XCIgKyBpbmZvICsgXCIgTm9kZTwvaDU+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbC5wYXJhbGxlbGlzbSAhPT0gXCJcIikge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5QYXJhbGxlbGlzbTogXCIgKyBlbC5wYXJhbGxlbGlzbSArIFwiPC9oNT5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLm9wZXJhdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+T3BlcmF0aW9uOiBcIiArIHNob3J0ZW5TdHJpbmcoZWwub3BlcmF0b3Jfc3RyYXRlZ3kpICsgXCI8L2g1PlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPC9kaXY+XCI7XG4gICAgICAgIHJldHVybiBsYWJlbFZhbHVlO1xuICAgICAgfTtcbiAgICAgIGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbiA9IGZ1bmN0aW9uKGlkLCBtYXhXLCBtYXhIKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlLCBzdmdJRDtcbiAgICAgICAgc3ZnSUQgPSBcInN2Zy1cIiArIGlkO1xuICAgICAgICBsYWJlbFZhbHVlID0gXCI8c3ZnIGNsYXNzPSdcIiArIHN2Z0lEICsgXCInIHdpZHRoPVwiICsgbWF4VyArIFwiIGhlaWdodD1cIiArIG1heEggKyBcIj48ZyAvPjwvc3ZnPlwiO1xuICAgICAgICByZXR1cm4gbGFiZWxWYWx1ZTtcbiAgICAgIH07XG4gICAgICBzaG9ydGVuU3RyaW5nID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgc2JyO1xuICAgICAgICBpZiAocy5jaGFyQXQoMCkgPT09IFwiPFwiKSB7XG4gICAgICAgICAgcyA9IHMucmVwbGFjZShcIjxcIiwgXCImbHQ7XCIpO1xuICAgICAgICAgIHMgPSBzLnJlcGxhY2UoXCI+XCIsIFwiJmd0O1wiKTtcbiAgICAgICAgfVxuICAgICAgICBzYnIgPSBcIlwiO1xuICAgICAgICB3aGlsZSAocy5sZW5ndGggPiAzMCkge1xuICAgICAgICAgIHNiciA9IHNiciArIHMuc3Vic3RyaW5nKDAsIDMwKSArIFwiPGJyPlwiO1xuICAgICAgICAgIHMgPSBzLnN1YnN0cmluZygzMCwgcy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHNiciA9IHNiciArIHM7XG4gICAgICAgIHJldHVybiBzYnI7XG4gICAgICB9O1xuICAgICAgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SCkge1xuICAgICAgICBpZiAoaXNQYXJlbnQgPT0gbnVsbCkge1xuICAgICAgICAgIGlzUGFyZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsLmlkID09PSBkYXRhLnBhcnRpYWxfc29sdXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInBhcnRpYWxTb2x1dGlvblwiLCBtYXhXLCBtYXhIKSxcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgXCJjbGFzc1wiOiBnZXROb2RlVHlwZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5uZXh0X3BhcnRpYWxfc29sdXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIm5leHRQYXJ0aWFsU29sdXRpb25cIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLndvcmtzZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIndvcmtzZXRcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwid29ya3NldFwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLm5leHRfd29ya3NldCkge1xuICAgICAgICAgIHJldHVybiBnLnNldE5vZGUoZWwuaWQsIHtcbiAgICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwibmV4dFdvcmtzZXRcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFdvcmtzZXRcIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5zb2x1dGlvbl9zZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInNvbHV0aW9uU2V0XCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uU2V0XCIpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuaWQgPT09IGRhdGEuc29sdXRpb25fZGVsdGEpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInNvbHV0aW9uRGVsdGFcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwic29sdXRpb25EZWx0YVwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBnLnNldE5vZGUoZWwuaWQsIHtcbiAgICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwiXCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcIlwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY3JlYXRlRWRnZSA9IGZ1bmN0aW9uKGcsIGRhdGEsIGVsLCBleGlzdGluZ05vZGVzLCBwcmVkKSB7XG4gICAgICAgIHZhciBtaXNzaW5nTm9kZTtcbiAgICAgICAgaWYgKGV4aXN0aW5nTm9kZXMuaW5kZXhPZihwcmVkLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXRFZGdlKHByZWQuaWQsIGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKHByZWQpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWlzc2luZ05vZGUgPSBzZWFyY2hGb3JOb2RlKGRhdGEsIHByZWQuaWQpO1xuICAgICAgICAgIGlmICghIW1pc3NpbmdOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gZy5zZXRFZGdlKG1pc3NpbmdOb2RlLmlkLCBlbC5pZCwge1xuICAgICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKG1pc3NpbmdOb2RlKSxcbiAgICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGxvYWRKc29uVG9EYWdyZSA9IGZ1bmN0aW9uKGcsIGRhdGEpIHtcbiAgICAgICAgdmFyIGVsLCBleGlzdGluZ05vZGVzLCBpc1BhcmVudCwgaywgbCwgbGVuLCBsZW4xLCBtYXhILCBtYXhXLCBwcmVkLCByLCByZWYsIHNnLCB0b0l0ZXJhdGU7XG4gICAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXTtcbiAgICAgICAgaWYgKGRhdGEubm9kZXMgIT0gbnVsbCkge1xuICAgICAgICAgIHRvSXRlcmF0ZSA9IGRhdGEubm9kZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5zdGVwX2Z1bmN0aW9uO1xuICAgICAgICAgIGlzUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSB0b0l0ZXJhdGUubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICBlbCA9IHRvSXRlcmF0ZVtrXTtcbiAgICAgICAgICBtYXhXID0gMDtcbiAgICAgICAgICBtYXhIID0gMDtcbiAgICAgICAgICBpZiAoZWwuc3RlcF9mdW5jdGlvbikge1xuICAgICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7XG4gICAgICAgICAgICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgICAgICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICAgICAgICB9KS5zZXRHcmFwaCh7XG4gICAgICAgICAgICAgIG5vZGVzZXA6IDIwLFxuICAgICAgICAgICAgICBlZGdlc2VwOiAwLFxuICAgICAgICAgICAgICByYW5rc2VwOiAyMCxcbiAgICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiLFxuICAgICAgICAgICAgICBtYXJnaW54OiAxMCxcbiAgICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3ViZ3JhcGhzW2VsLmlkXSA9IHNnO1xuICAgICAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKHNnLCBlbCk7XG4gICAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKCk7XG4gICAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKTtcbiAgICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoO1xuICAgICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0O1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG1haW5UbXBFbGVtZW50KS5lbXB0eSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SCk7XG4gICAgICAgICAgZXhpc3RpbmdOb2Rlcy5wdXNoKGVsLmlkKTtcbiAgICAgICAgICBpZiAoZWwuaW5wdXRzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlZiA9IGVsLmlucHV0cztcbiAgICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICAgIHByZWQgPSByZWZbbF07XG4gICAgICAgICAgICAgIGNyZWF0ZUVkZ2UoZywgZGF0YSwgZWwsIGV4aXN0aW5nTm9kZXMsIHByZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZztcbiAgICAgIH07XG4gICAgICBzZWFyY2hGb3JOb2RlID0gZnVuY3Rpb24oZGF0YSwgbm9kZUlEKSB7XG4gICAgICAgIHZhciBlbCwgaSwgajtcbiAgICAgICAgZm9yIChpIGluIGRhdGEubm9kZXMpIHtcbiAgICAgICAgICBlbCA9IGRhdGEubm9kZXNbaV07XG4gICAgICAgICAgaWYgKGVsLmlkID09PSBub2RlSUQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLnN0ZXBfZnVuY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yIChqIGluIGVsLnN0ZXBfZnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgaWYgKGVsLnN0ZXBfZnVuY3Rpb25bal0uaWQgPT09IG5vZGVJRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5zdGVwX2Z1bmN0aW9uW2pdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZHJhd0dyYXBoID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaSwgbmV3U2NhbGUsIHJlbmRlcmVyLCBzZywgeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldDtcbiAgICAgICAgZyA9IG5ldyBkYWdyZUQzLmdyYXBobGliLkdyYXBoKHtcbiAgICAgICAgICBtdWx0aWdyYXBoOiB0cnVlLFxuICAgICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICAgIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICBub2Rlc2VwOiA3MCxcbiAgICAgICAgICBlZGdlc2VwOiAwLFxuICAgICAgICAgIHJhbmtzZXA6IDUwLFxuICAgICAgICAgIHJhbmtkaXI6IFwiTFJcIixcbiAgICAgICAgICBtYXJnaW54OiA0MCxcbiAgICAgICAgICBtYXJnaW55OiA0MFxuICAgICAgICB9KTtcbiAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIGRhdGEpO1xuICAgICAgICByZW5kZXJlciA9IG5ldyBkYWdyZUQzLnJlbmRlcigpO1xuICAgICAgICBkM21haW5TdmdHLmNhbGwocmVuZGVyZXIsIGcpO1xuICAgICAgICBmb3IgKGkgaW4gc3ViZ3JhcGhzKSB7XG4gICAgICAgICAgc2cgPSBzdWJncmFwaHNbaV07XG4gICAgICAgICAgZDNtYWluU3ZnLnNlbGVjdCgnc3ZnLnN2Zy0nICsgaSArICcgZycpLmNhbGwocmVuZGVyZXIsIHNnKTtcbiAgICAgICAgfVxuICAgICAgICBuZXdTY2FsZSA9IDAuNTtcbiAgICAgICAgeENlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkud2lkdGgoKSAtIGcuZ3JhcGgoKS53aWR0aCAqIG5ld1NjYWxlKSAvIDIpO1xuICAgICAgICB5Q2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcigoYW5ndWxhci5lbGVtZW50KG1haW5TdmdFbGVtZW50KS5oZWlnaHQoKSAtIGcuZ3JhcGgoKS5oZWlnaHQgKiBuZXdTY2FsZSkgLyAyKTtcbiAgICAgICAgbWFpblpvb20uc2NhbGUobmV3U2NhbGUpLnRyYW5zbGF0ZShbeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldF0pO1xuICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB4Q2VudGVyT2Zmc2V0ICsgXCIsIFwiICsgeUNlbnRlck9mZnNldCArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIik7XG4gICAgICAgIG1haW5ab29tLm9uKFwiem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXY7XG4gICAgICAgICAgZXYgPSBkMy5ldmVudDtcbiAgICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgZXYudHJhbnNsYXRlICsgXCIpIHNjYWxlKFwiICsgZXYuc2NhbGUgKyBcIilcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBtYWluWm9vbShkM21haW5TdmcpO1xuICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5zZWxlY3RBbGwoJy5ub2RlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBzY29wZS5zZXROb2RlKHtcbiAgICAgICAgICAgIG5vZGVpZDogZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBzY29wZS4kd2F0Y2goYXR0cnMucGxhbiwgZnVuY3Rpb24obmV3UGxhbikge1xuICAgICAgICBpZiAobmV3UGxhbikge1xuICAgICAgICAgIHJldHVybiBkcmF3R3JhcGgobmV3UGxhbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JzU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRsb2csIGFtTW9tZW50LCAkcSwgJHRpbWVvdXQpIC0+XG4gIGN1cnJlbnRKb2IgPSBudWxsXG4gIGN1cnJlbnRQbGFuID0gbnVsbFxuXG4gIGRlZmVycmVkcyA9IHt9XG4gIGpvYnMgPSB7XG4gICAgcnVubmluZzogW11cbiAgICBmaW5pc2hlZDogW11cbiAgICBjYW5jZWxsZWQ6IFtdXG4gICAgZmFpbGVkOiBbXVxuICB9XG5cbiAgam9iT2JzZXJ2ZXJzID0gW11cblxuICBub3RpZnlPYnNlcnZlcnMgPSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBqb2JPYnNlcnZlcnMsIChjYWxsYmFjaykgLT5cbiAgICAgIGNhbGxiYWNrKClcblxuICBAcmVnaXN0ZXJPYnNlcnZlciA9IChjYWxsYmFjaykgLT5cbiAgICBqb2JPYnNlcnZlcnMucHVzaChjYWxsYmFjaylcblxuICBAdW5SZWdpc3Rlck9ic2VydmVyID0gKGNhbGxiYWNrKSAtPlxuICAgIGluZGV4ID0gam9iT2JzZXJ2ZXJzLmluZGV4T2YoY2FsbGJhY2spXG4gICAgam9iT2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSlcblxuICBAc3RhdGVMaXN0ID0gLT5cbiAgICBbIFxuICAgICAgIyAnQ1JFQVRFRCdcbiAgICAgICdTQ0hFRFVMRUQnXG4gICAgICAnREVQTE9ZSU5HJ1xuICAgICAgJ1JVTk5JTkcnXG4gICAgICAnRklOSVNIRUQnXG4gICAgICAnRkFJTEVEJ1xuICAgICAgJ0NBTkNFTElORydcbiAgICAgICdDQU5DRUxFRCdcbiAgICBdXG5cbiAgQHRyYW5zbGF0ZUxhYmVsU3RhdGUgPSAoc3RhdGUpIC0+XG4gICAgc3dpdGNoIHN0YXRlLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoZW4gJ2ZpbmlzaGVkJyB0aGVuICdzdWNjZXNzJ1xuICAgICAgd2hlbiAnZmFpbGVkJyB0aGVuICdkYW5nZXInXG4gICAgICB3aGVuICdzY2hlZHVsZWQnIHRoZW4gJ2RlZmF1bHQnXG4gICAgICB3aGVuICdkZXBsb3lpbmcnIHRoZW4gJ2luZm8nXG4gICAgICB3aGVuICdydW5uaW5nJyB0aGVuICdwcmltYXJ5J1xuICAgICAgd2hlbiAnY2FuY2VsaW5nJyB0aGVuICd3YXJuaW5nJ1xuICAgICAgd2hlbiAncGVuZGluZycgdGhlbiAnaW5mbydcbiAgICAgIHdoZW4gJ3RvdGFsJyB0aGVuICdibGFjaydcbiAgICAgIGVsc2UgJ2RlZmF1bHQnXG5cbiAgQHNldEVuZFRpbWVzID0gKGxpc3QpIC0+XG4gICAgYW5ndWxhci5mb3JFYWNoIGxpc3QsIChpdGVtLCBqb2JLZXkpIC0+XG4gICAgICB1bmxlc3MgaXRlbVsnZW5kLXRpbWUnXSA+IC0xXG4gICAgICAgIGl0ZW1bJ2VuZC10aW1lJ10gPSBpdGVtWydzdGFydC10aW1lJ10gKyBpdGVtWydkdXJhdGlvbiddXG5cbiAgQHByb2Nlc3NWZXJ0aWNlcyA9IChkYXRhKSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLnZlcnRpY2VzLCAodmVydGV4LCBpKSAtPlxuICAgICAgdmVydGV4LnR5cGUgPSAncmVndWxhcidcblxuICAgIGRhdGEudmVydGljZXMudW5zaGlmdCh7XG4gICAgICBuYW1lOiAnU2NoZWR1bGVkJ1xuICAgICAgJ3N0YXJ0LXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXVxuICAgICAgJ2VuZC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ10gKyAxXG4gICAgICB0eXBlOiAnc2NoZWR1bGVkJ1xuICAgIH0pXG5cbiAgQGxpc3RKb2JzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm92ZXJ2aWV3XCJcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICBhbmd1bGFyLmZvckVhY2ggZGF0YSwgKGxpc3QsIGxpc3RLZXkpID0+XG4gICAgICAgIHN3aXRjaCBsaXN0S2V5XG4gICAgICAgICAgd2hlbiAncnVubmluZycgdGhlbiBqb2JzLnJ1bm5pbmcgPSBAc2V0RW5kVGltZXMobGlzdClcbiAgICAgICAgICB3aGVuICdmaW5pc2hlZCcgdGhlbiBqb2JzLmZpbmlzaGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnY2FuY2VsbGVkJyB0aGVuIGpvYnMuY2FuY2VsbGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnZmFpbGVkJyB0aGVuIGpvYnMuZmFpbGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoam9icylcbiAgICAgIG5vdGlmeU9ic2VydmVycygpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldEpvYnMgPSAodHlwZSkgLT5cbiAgICBqb2JzW3R5cGVdXG5cbiAgQGdldEFsbEpvYnMgPSAtPlxuICAgIGpvYnNcblxuICBAbG9hZEpvYiA9IChqb2JpZCkgLT5cbiAgICBjdXJyZW50Sm9iID0gbnVsbFxuICAgIGRlZmVycmVkcy5qb2IgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWRcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICBAc2V0RW5kVGltZXMoZGF0YS52ZXJ0aWNlcylcbiAgICAgIEBwcm9jZXNzVmVydGljZXMoZGF0YSlcblxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvY29uZmlnXCJcbiAgICAgIC5zdWNjZXNzIChqb2JDb25maWcpIC0+XG4gICAgICAgIGRhdGEgPSBhbmd1bGFyLmV4dGVuZChkYXRhLCBqb2JDb25maWcpXG5cbiAgICAgICAgY3VycmVudEpvYiA9IGRhdGFcblxuICAgICAgICBkZWZlcnJlZHMuam9iLnJlc29sdmUoY3VycmVudEpvYilcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZVxuXG4gIEBnZXROb2RlID0gKG5vZGVpZCkgLT5cbiAgICBzZWVrTm9kZSA9IChub2RlaWQsIGRhdGEpIC0+XG4gICAgICBmb3Igbm9kZSBpbiBkYXRhXG4gICAgICAgIHJldHVybiBub2RlIGlmIG5vZGUuaWQgaXMgbm9kZWlkXG4gICAgICAgIHN1YiA9IHNlZWtOb2RlKG5vZGVpZCwgbm9kZS5zdGVwX2Z1bmN0aW9uKSBpZiBub2RlLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgcmV0dXJuIHN1YiBpZiBzdWJcblxuICAgICAgbnVsbFxuXG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgIGZvdW5kTm9kZSA9IHNlZWtOb2RlKG5vZGVpZCwgY3VycmVudEpvYi5wbGFuLm5vZGVzKVxuXG4gICAgICBmb3VuZE5vZGUudmVydGV4ID0gQHNlZWtWZXJ0ZXgobm9kZWlkKVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZvdW5kTm9kZSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAc2Vla1ZlcnRleCA9IChub2RlaWQpIC0+XG4gICAgZm9yIHZlcnRleCBpbiBjdXJyZW50Sm9iLnZlcnRpY2VzXG4gICAgICByZXR1cm4gdmVydGV4IGlmIHZlcnRleC5pZCBpcyBub2RlaWRcblxuICAgIHJldHVybiBudWxsXG5cbiAgQGdldFZlcnRleCA9ICh2ZXJ0ZXhpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgdmVydGV4ID0gQHNlZWtWZXJ0ZXgodmVydGV4aWQpXG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9zdWJ0YXNrdGltZXNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICAgICMgVE9ETzogY2hhbmdlIHRvIHN1YnRhc2t0aW1lc1xuICAgICAgICB2ZXJ0ZXguc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2ZXJ0ZXgpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldFN1YnRhc2tzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzdWJ0YXNrcylcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZ2V0VGFza01hbmFnZXJzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvdGFza21hbmFnZXJzXCJcbiAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICB0YXNrbWFuYWdlcnMgPSBkYXRhLnRhc2ttYW5hZ2Vyc1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodGFza21hbmFnZXJzKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRBY2N1bXVsYXRvcnMgPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgICMgdmVydGV4ID0gQHNlZWtWZXJ0ZXgodmVydGV4aWQpXG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9hY2N1bXVsYXRvcnNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgIGFjY3VtdWxhdG9ycyA9IGRhdGFbJ3VzZXItYWNjdW11bGF0b3JzJ11cblxuICAgICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3MvYWNjdW11bGF0b3JzXCJcbiAgICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgICAgc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3NcblxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeyBtYWluOiBhY2N1bXVsYXRvcnMsIHN1YnRhc2tzOiBzdWJ0YXNrQWNjdW11bGF0b3JzIH0pXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgIyBKb2ItbGV2ZWwgY2hlY2twb2ludCBzdGF0c1xuICBAZ2V0Sm9iQ2hlY2twb2ludFN0YXRzID0gKGpvYmlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvY2hlY2twb2ludHNcIlxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgPT5cbiAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGVmZXJyZWQucmVzb2x2ZShudWxsKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgT3BlcmF0b3ItbGV2ZWwgY2hlY2twb2ludCBzdGF0c1xuICBAZ2V0T3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9jaGVja3BvaW50c1wiXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgIyBJZiBubyBkYXRhIGF2YWlsYWJsZSwgd2UgYXJlIGRvbmUuXG4gICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7IG9wZXJhdG9yU3RhdHM6IG51bGwsIHN1YnRhc2tzU3RhdHM6IG51bGwgfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdG9yU3RhdHMgPSB7IGlkOiBkYXRhWydpZCddLCB0aW1lc3RhbXA6IGRhdGFbJ3RpbWVzdGFtcCddLCBkdXJhdGlvbjogZGF0YVsnZHVyYXRpb24nXSwgc2l6ZTogZGF0YVsnc2l6ZSddIH1cblxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YVsnc3VidGFza3MnXSkpXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsgb3BlcmF0b3JTdGF0czogb3BlcmF0b3JTdGF0cywgc3VidGFza3NTdGF0czogbnVsbCB9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN1YnRhc2tTdGF0cyA9IGRhdGFbJ3N1YnRhc2tzJ11cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeyBvcGVyYXRvclN0YXRzOiBvcGVyYXRvclN0YXRzLCBzdWJ0YXNrc1N0YXRzOiBzdWJ0YXNrU3RhdHMgfSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIE9wZXJhdG9yLWxldmVsIGJhY2sgcHJlc3N1cmUgc3RhdHNcbiAgQGdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2JhY2twcmVzc3VyZVwiXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQHRyYW5zbGF0ZUJhY2tQcmVzc3VyZUxhYmVsU3RhdGUgPSAoc3RhdGUpIC0+XG4gICAgc3dpdGNoIHN0YXRlLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoZW4gJ2luLXByb2dyZXNzJyB0aGVuICdkYW5nZXInXG4gICAgICB3aGVuICdvaycgdGhlbiAnc3VjY2VzcydcbiAgICAgIHdoZW4gJ2xvdycgdGhlbiAnd2FybmluZydcbiAgICAgIHdoZW4gJ2hpZ2gnIHRoZW4gJ2RhbmdlcidcbiAgICAgIGVsc2UgJ2RlZmF1bHQnXG5cbiAgQGxvYWRFeGNlcHRpb25zID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9leGNlcHRpb25zXCJcbiAgICAgIC5zdWNjZXNzIChleGNlcHRpb25zKSAtPlxuICAgICAgICBjdXJyZW50Sm9iLmV4Y2VwdGlvbnMgPSBleGNlcHRpb25zXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShleGNlcHRpb25zKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBjYW5jZWxKb2IgPSAoam9iaWQpIC0+XG4gICAgIyB1c2VzIHRoZSBub24gUkVTVC1jb21wbGlhbnQgR0VUIHlhcm4tY2FuY2VsIGhhbmRsZXIgd2hpY2ggaXMgYXZhaWxhYmxlIGluIGFkZGl0aW9uIHRvIHRoZVxuICAgICMgcHJvcGVyIFwiREVMRVRFIGpvYnMvPGpvYmlkPi9cIlxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3lhcm4tY2FuY2VsXCJcblxuICBAc3RvcEpvYiA9IChqb2JpZCkgLT5cbiAgICAjIHVzZXMgdGhlIG5vbiBSRVNULWNvbXBsaWFudCBHRVQgeWFybi1jYW5jZWwgaGFuZGxlciB3aGljaCBpcyBhdmFpbGFibGUgaW4gYWRkaXRpb24gdG8gdGhlXG4gICAgIyBwcm9wZXIgXCJERUxFVEUgam9icy88am9iaWQ+L1wiXG4gICAgJGh0dHAuZ2V0IFwiam9icy9cIiArIGpvYmlkICsgXCIveWFybi1zdG9wXCJcblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdKb2JzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJGxvZywgYW1Nb21lbnQsICRxLCAkdGltZW91dCkge1xuICB2YXIgY3VycmVudEpvYiwgY3VycmVudFBsYW4sIGRlZmVycmVkcywgam9iT2JzZXJ2ZXJzLCBqb2JzLCBub3RpZnlPYnNlcnZlcnM7XG4gIGN1cnJlbnRKb2IgPSBudWxsO1xuICBjdXJyZW50UGxhbiA9IG51bGw7XG4gIGRlZmVycmVkcyA9IHt9O1xuICBqb2JzID0ge1xuICAgIHJ1bm5pbmc6IFtdLFxuICAgIGZpbmlzaGVkOiBbXSxcbiAgICBjYW5jZWxsZWQ6IFtdLFxuICAgIGZhaWxlZDogW11cbiAgfTtcbiAgam9iT2JzZXJ2ZXJzID0gW107XG4gIG5vdGlmeU9ic2VydmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2goam9iT2JzZXJ2ZXJzLCBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH07XG4gIHRoaXMucmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGpvYk9ic2VydmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcbiAgdGhpcy51blJlZ2lzdGVyT2JzZXJ2ZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IGpvYk9ic2VydmVycy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gam9iT2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH07XG4gIHRoaXMuc3RhdGVMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFsnU0NIRURVTEVEJywgJ0RFUExPWUlORycsICdSVU5OSU5HJywgJ0ZJTklTSEVEJywgJ0ZBSUxFRCcsICdDQU5DRUxJTkcnLCAnQ0FOQ0VMRUQnXTtcbiAgfTtcbiAgdGhpcy50cmFuc2xhdGVMYWJlbFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2ZpbmlzaGVkJzpcbiAgICAgICAgcmV0dXJuICdzdWNjZXNzJztcbiAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgIHJldHVybiAnZGFuZ2VyJztcbiAgICAgIGNhc2UgJ3NjaGVkdWxlZCc6XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCc7XG4gICAgICBjYXNlICdkZXBsb3lpbmcnOlxuICAgICAgICByZXR1cm4gJ2luZm8nO1xuICAgICAgY2FzZSAncnVubmluZyc6XG4gICAgICAgIHJldHVybiAncHJpbWFyeSc7XG4gICAgICBjYXNlICdjYW5jZWxpbmcnOlxuICAgICAgICByZXR1cm4gJ3dhcm5pbmcnO1xuICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgICBjYXNlICd0b3RhbCc6XG4gICAgICAgIHJldHVybiAnYmxhY2snO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0JztcbiAgICB9XG4gIH07XG4gIHRoaXMuc2V0RW5kVGltZXMgPSBmdW5jdGlvbihsaXN0KSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihpdGVtLCBqb2JLZXkpIHtcbiAgICAgIGlmICghKGl0ZW1bJ2VuZC10aW1lJ10gPiAtMSkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1bJ2VuZC10aW1lJ10gPSBpdGVtWydzdGFydC10aW1lJ10gKyBpdGVtWydkdXJhdGlvbiddO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICB0aGlzLnByb2Nlc3NWZXJ0aWNlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBhbmd1bGFyLmZvckVhY2goZGF0YS52ZXJ0aWNlcywgZnVuY3Rpb24odmVydGV4LCBpKSB7XG4gICAgICByZXR1cm4gdmVydGV4LnR5cGUgPSAncmVndWxhcic7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGEudmVydGljZXMudW5zaGlmdCh7XG4gICAgICBuYW1lOiAnU2NoZWR1bGVkJyxcbiAgICAgICdzdGFydC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ10sXG4gICAgICAnZW5kLXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXSArIDEsXG4gICAgICB0eXBlOiAnc2NoZWR1bGVkJ1xuICAgIH0pO1xuICB9O1xuICB0aGlzLmxpc3RKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JvdmVydmlld1wiKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihsaXN0LCBsaXN0S2V5KSB7XG4gICAgICAgICAgc3dpdGNoIChsaXN0S2V5KSB7XG4gICAgICAgICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgICAgICAgcmV0dXJuIGpvYnMucnVubmluZyA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgICAgY2FzZSAnZmluaXNoZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5maW5pc2hlZCA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgICAgICAgcmV0dXJuIGpvYnMuY2FuY2VsbGVkID0gX3RoaXMuc2V0RW5kVGltZXMobGlzdCk7XG4gICAgICAgICAgICBjYXNlICdmYWlsZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5mYWlsZWQgPSBfdGhpcy5zZXRFbmRUaW1lcyhsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYnMpO1xuICAgICAgICByZXR1cm4gbm90aWZ5T2JzZXJ2ZXJzKCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRKb2JzID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiBqb2JzW3R5cGVdO1xuICB9O1xuICB0aGlzLmdldEFsbEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gam9icztcbiAgfTtcbiAgdGhpcy5sb2FkSm9iID0gZnVuY3Rpb24oam9iaWQpIHtcbiAgICBjdXJyZW50Sm9iID0gbnVsbDtcbiAgICBkZWZlcnJlZHMuam9iID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgX3RoaXMuc2V0RW5kVGltZXMoZGF0YS52ZXJ0aWNlcyk7XG4gICAgICAgIF90aGlzLnByb2Nlc3NWZXJ0aWNlcyhkYXRhKTtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGpvYkNvbmZpZykge1xuICAgICAgICAgIGRhdGEgPSBhbmd1bGFyLmV4dGVuZChkYXRhLCBqb2JDb25maWcpO1xuICAgICAgICAgIGN1cnJlbnRKb2IgPSBkYXRhO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZHMuam9iLnJlc29sdmUoY3VycmVudEpvYik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkcy5qb2IucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXROb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgdmFyIGRlZmVycmVkLCBzZWVrTm9kZTtcbiAgICBzZWVrTm9kZSA9IGZ1bmN0aW9uKG5vZGVpZCwgZGF0YSkge1xuICAgICAgdmFyIGosIGxlbiwgbm9kZSwgc3ViO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBub2RlID0gZGF0YVtqXTtcbiAgICAgICAgaWYgKG5vZGUuaWQgPT09IG5vZGVpZCkge1xuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnN0ZXBfZnVuY3Rpb24pIHtcbiAgICAgICAgICBzdWIgPSBzZWVrTm9kZShub2RlaWQsIG5vZGUuc3RlcF9mdW5jdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIHJldHVybiBzdWI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGZvdW5kTm9kZTtcbiAgICAgICAgZm91bmROb2RlID0gc2Vla05vZGUobm9kZWlkLCBjdXJyZW50Sm9iLnBsYW4ubm9kZXMpO1xuICAgICAgICBmb3VuZE5vZGUudmVydGV4ID0gX3RoaXMuc2Vla1ZlcnRleChub2RlaWQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShmb3VuZE5vZGUpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuc2Vla1ZlcnRleCA9IGZ1bmN0aW9uKG5vZGVpZCkge1xuICAgIHZhciBqLCBsZW4sIHJlZiwgdmVydGV4O1xuICAgIHJlZiA9IGN1cnJlbnRKb2IudmVydGljZXM7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2ZXJ0ZXggPSByZWZbal07XG4gICAgICBpZiAodmVydGV4LmlkID09PSBub2RlaWQpIHtcbiAgICAgICAgcmV0dXJuIHZlcnRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIHRoaXMuZ2V0VmVydGV4ID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHZlcnRleDtcbiAgICAgICAgdmVydGV4ID0gX3RoaXMuc2Vla1ZlcnRleCh2ZXJ0ZXhpZCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3RpbWVzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZlcnRleC5zdWJ0YXNrcyA9IGRhdGEuc3VidGFza3M7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUodmVydGV4KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRTdWJ0YXNrcyA9IGZ1bmN0aW9uKHZlcnRleGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgc3VidGFza3M7XG4gICAgICAgICAgc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHN1YnRhc2tzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRUYXNrTWFuYWdlcnMgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL3Rhc2ttYW5hZ2Vyc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgdGFza21hbmFnZXJzO1xuICAgICAgICAgIHRhc2ttYW5hZ2VycyA9IGRhdGEudGFza21hbmFnZXJzO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHRhc2ttYW5hZ2Vycyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0QWNjdW11bGF0b3JzID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9hY2N1bXVsYXRvcnNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGFjY3VtdWxhdG9ycztcbiAgICAgICAgICBhY2N1bXVsYXRvcnMgPSBkYXRhWyd1c2VyLWFjY3VtdWxhdG9ycyddO1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3MvYWNjdW11bGF0b3JzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHN1YnRhc2tBY2N1bXVsYXRvcnM7XG4gICAgICAgICAgICBzdWJ0YXNrQWNjdW11bGF0b3JzID0gZGF0YS5zdWJ0YXNrcztcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgbWFpbjogYWNjdW11bGF0b3JzLFxuICAgICAgICAgICAgICBzdWJ0YXNrczogc3VidGFza0FjY3VtdWxhdG9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0Sm9iQ2hlY2twb2ludFN0YXRzID0gZnVuY3Rpb24oam9iaWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL2NoZWNrcG9pbnRzXCIpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHt9LCBkYXRhKSkge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRlZmVycmVkLnJlc29sdmUobnVsbCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRPcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IGZ1bmN0aW9uKHZlcnRleGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvY2hlY2twb2ludHNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIG9wZXJhdG9yU3RhdHMsIHN1YnRhc2tTdGF0cztcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIG9wZXJhdG9yU3RhdHM6IG51bGwsXG4gICAgICAgICAgICAgIHN1YnRhc2tzU3RhdHM6IG51bGxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcGVyYXRvclN0YXRzID0ge1xuICAgICAgICAgICAgICBpZDogZGF0YVsnaWQnXSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBkYXRhWyd0aW1lc3RhbXAnXSxcbiAgICAgICAgICAgICAgZHVyYXRpb246IGRhdGFbJ2R1cmF0aW9uJ10sXG4gICAgICAgICAgICAgIHNpemU6IGRhdGFbJ3NpemUnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YVsnc3VidGFza3MnXSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgICAgIG9wZXJhdG9yU3RhdHM6IG9wZXJhdG9yU3RhdHMsXG4gICAgICAgICAgICAgICAgc3VidGFza3NTdGF0czogbnVsbFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN1YnRhc2tTdGF0cyA9IGRhdGFbJ3N1YnRhc2tzJ107XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRvclN0YXRzOiBvcGVyYXRvclN0YXRzLFxuICAgICAgICAgICAgICAgIHN1YnRhc2tzU3RhdHM6IHN1YnRhc2tTdGF0c1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2JhY2twcmVzc3VyZVwiKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy50cmFuc2xhdGVCYWNrUHJlc3N1cmVMYWJlbFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2luLXByb2dyZXNzJzpcbiAgICAgICAgcmV0dXJuICdkYW5nZXInO1xuICAgICAgY2FzZSAnb2snOlxuICAgICAgICByZXR1cm4gJ3N1Y2Nlc3MnO1xuICAgICAgY2FzZSAnbG93JzpcbiAgICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICAgIGNhc2UgJ2hpZ2gnOlxuICAgICAgICByZXR1cm4gJ2Rhbmdlcic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5sb2FkRXhjZXB0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvZXhjZXB0aW9uc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGV4Y2VwdGlvbnMpIHtcbiAgICAgICAgICBjdXJyZW50Sm9iLmV4Y2VwdGlvbnMgPSBleGNlcHRpb25zO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGV4Y2VwdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmNhbmNlbEpvYiA9IGZ1bmN0aW9uKGpvYmlkKSB7XG4gICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3lhcm4tY2FuY2VsXCIpO1xuICB9O1xuICB0aGlzLnN0b3BKb2IgPSBmdW5jdGlvbihqb2JpZCkge1xuICAgIHJldHVybiAkaHR0cC5nZXQoXCJqb2JzL1wiICsgam9iaWQgKyBcIi95YXJuLXN0b3BcIik7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ21ldHJpY3NHcmFwaCcsIC0+XG4gIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHQgcGFuZWwtbWV0cmljXCI+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgICAgICAgICB7e21ldHJpYy5pZH19XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmctY2xhc3M9XCJbYnRuQ2xhc3Nlcywge2FjdGl2ZTogbWV0cmljLnNpemUgIT0gXFwnYmlnXFwnfV1cIiBuZy1jbGljaz1cInNldFNpemUoXFwnc21hbGxcXCcpXCI+U21hbGw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy5zaXplID09IFxcJ2JpZ1xcJ31dXCIgbmctY2xpY2s9XCJzZXRTaXplKFxcJ2JpZ1xcJylcIj5CaWc8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICA8YSB0aXRsZT1cIlJlbW92ZVwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyByZW1vdmVcIiBuZy1jbGljaz1cInJlbW92ZU1ldHJpYygpXCI+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiIC8+PC9hPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxzdmcgLz5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgIDwvZGl2PidcbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTpcbiAgICBtZXRyaWM6IFwiPVwiXG4gICAgd2luZG93OiBcIj1cIlxuICAgIHJlbW92ZU1ldHJpYzogXCImXCJcbiAgICBzZXRNZXRyaWNTaXplOiBcIj1cIlxuICAgIGdldFZhbHVlczogXCImXCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmJ0bkNsYXNzZXMgPSBbJ2J0bicsICdidG4tZGVmYXVsdCcsICdidG4teHMnXVxuXG4gICAgc2NvcGUudmFsdWUgPSBudWxsXG4gICAgc2NvcGUuZGF0YSA9IFt7XG4gICAgICB2YWx1ZXM6IHNjb3BlLmdldFZhbHVlcygpXG4gICAgfV1cblxuICAgIHNjb3BlLm9wdGlvbnMgPSB7XG4gICAgICB4OiAoZCwgaSkgLT5cbiAgICAgICAgZC54XG4gICAgICB5OiAoZCwgaSkgLT5cbiAgICAgICAgZC55XG5cbiAgICAgIHhUaWNrRm9ybWF0OiAoZCkgLT5cbiAgICAgICAgZDMudGltZS5mb3JtYXQoJyVIOiVNOiVTJykobmV3IERhdGUoZCkpXG5cbiAgICAgIHlUaWNrRm9ybWF0OiAoZCkgLT5cbiAgICAgICAgaWYgZCA+PSAxMDAwMDAwXG4gICAgICAgICAgXCIje2QgLyAxMDAwMDAwfW1cIlxuICAgICAgICBlbHNlIGlmIGQgPj0gMTAwMFxuICAgICAgICAgIFwiI3tkIC8gMTAwMH1rXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRcbiAgICB9XG5cbiAgICBzY29wZS5zaG93Q2hhcnQgPSAtPlxuICAgICAgZDMuc2VsZWN0KGVsZW1lbnQuZmluZChcInN2Z1wiKVswXSlcbiAgICAgIC5kYXR1bShzY29wZS5kYXRhKVxuICAgICAgLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyNTApXG4gICAgICAuY2FsbChzY29wZS5jaGFydClcblxuICAgIHNjb3BlLmNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpXG4gICAgICAub3B0aW9ucyhzY29wZS5vcHRpb25zKVxuICAgICAgLnNob3dMZWdlbmQoZmFsc2UpXG4gICAgICAubWFyZ2luKHtcbiAgICAgICAgdG9wOiAxNVxuICAgICAgICBsZWZ0OiA1MFxuICAgICAgICBib3R0b206IDMwXG4gICAgICAgIHJpZ2h0OiAzMFxuICAgICAgfSlcblxuICAgIHNjb3BlLmNoYXJ0LnlBeGlzLnNob3dNYXhNaW4oZmFsc2UpXG4gICAgc2NvcGUuY2hhcnQudG9vbHRpcC5oaWRlRGVsYXkoMClcbiAgICBzY29wZS5jaGFydC50b29sdGlwLmNvbnRlbnRHZW5lcmF0b3IoKG9iaikgLT5cbiAgICAgIFwiPHA+I3tkMy50aW1lLmZvcm1hdCgnJUg6JU06JVMnKShuZXcgRGF0ZShvYmoucG9pbnQueCkpfSB8ICN7b2JqLnBvaW50Lnl9PC9wPlwiXG4gICAgKVxuXG4gICAgbnYudXRpbHMud2luZG93UmVzaXplKHNjb3BlLmNoYXJ0LnVwZGF0ZSk7XG5cbiMgICAgc2NvcGUucmVtb3ZlID0gLT5cbiMgICAgICBzY29wZS4kZGVzdHJveSgpXG5cbiAgICBzY29wZS5zZXRTaXplID0gKHNpemUpIC0+XG4gICAgICBzY29wZS5zZXRNZXRyaWNTaXplKHNjb3BlLm1ldHJpYywgc2l6ZSlcbiMgICAgICBzY29wZS5tZXRyaWMuc2l6ZSA9IHNpemVcbiMgICAgICBzY29wZS5jaGFydC51cGRhdGUoKVxuXG4gICAgc2NvcGUuc2hvd0NoYXJ0KClcblxuICAgIHNjb3BlLiRvbiAnbWV0cmljczpkYXRhOnVwZGF0ZScsIChldmVudCwgdGltZXN0YW1wLCBkYXRhKSAtPlxuIyAgICAgIGNvbnNvbGUubG9nIGRhdGEsIHNjb3BlLm1ldHJpYywgc2NvcGUubWV0cmljLmlkXG4gICAgICBzY29wZS52YWx1ZSA9IHBhcnNlSW50KGRhdGFbc2NvcGUubWV0cmljLmlkXSlcblxuICAgICAgc2NvcGUuZGF0YVswXS52YWx1ZXMucHVzaCB7XG4gICAgICAgIHg6IHRpbWVzdGFtcFxuICAgICAgICB5OiBzY29wZS52YWx1ZVxuICAgICAgfVxuXG4gICAgICBpZiBzY29wZS5kYXRhWzBdLnZhbHVlcy5sZW5ndGggPiBzY29wZS53aW5kb3dcbiAgICAgICAgc2NvcGUuZGF0YVswXS52YWx1ZXMuc2hpZnQoKVxuXG4gICAgICBzY29wZS5zaG93Q2hhcnQoKVxuICAgICAgc2NvcGUuY2hhcnQuY2xlYXJIaWdobGlnaHRzKClcbiAgICAgIHNjb3BlLmNoYXJ0LnRvb2x0aXAuaGlkZGVuKHRydWUpXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5kaXJlY3RpdmUoJ21ldHJpY3NHcmFwaCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHQgcGFuZWwtbWV0cmljXCI+IDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+IHt7bWV0cmljLmlkfX0gPGRpdiBjbGFzcz1cImJ1dHRvbnNcIj4gPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMuc2l6ZSAhPSBcXCdiaWdcXCd9XVwiIG5nLWNsaWNrPVwic2V0U2l6ZShcXCdzbWFsbFxcJylcIj5TbWFsbDwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMuc2l6ZSA9PSBcXCdiaWdcXCd9XVwiIG5nLWNsaWNrPVwic2V0U2l6ZShcXCdiaWdcXCcpXCI+QmlnPC9idXR0b24+IDwvZGl2PiA8YSB0aXRsZT1cIlJlbW92ZVwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyByZW1vdmVcIiBuZy1jbGljaz1cInJlbW92ZU1ldHJpYygpXCI+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiIC8+PC9hPiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+IDxzdmcgLz4gPC9kaXY+IDwvZGl2PicsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgbWV0cmljOiBcIj1cIixcbiAgICAgIHdpbmRvdzogXCI9XCIsXG4gICAgICByZW1vdmVNZXRyaWM6IFwiJlwiLFxuICAgICAgc2V0TWV0cmljU2l6ZTogXCI9XCIsXG4gICAgICBnZXRWYWx1ZXM6IFwiJlwiXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLmJ0bkNsYXNzZXMgPSBbJ2J0bicsICdidG4tZGVmYXVsdCcsICdidG4teHMnXTtcbiAgICAgIHNjb3BlLnZhbHVlID0gbnVsbDtcbiAgICAgIHNjb3BlLmRhdGEgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZXM6IHNjb3BlLmdldFZhbHVlcygpXG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgICBzY29wZS5vcHRpb25zID0ge1xuICAgICAgICB4OiBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIGQueDtcbiAgICAgICAgfSxcbiAgICAgICAgeTogZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAgIHJldHVybiBkLnk7XG4gICAgICAgIH0sXG4gICAgICAgIHhUaWNrRm9ybWF0OiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGQzLnRpbWUuZm9ybWF0KCclSDolTTolUycpKG5ldyBEYXRlKGQpKTtcbiAgICAgICAgfSxcbiAgICAgICAgeVRpY2tGb3JtYXQ6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBpZiAoZCA+PSAxMDAwMDAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKGQgLyAxMDAwMDAwKSArIFwibVwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZCA+PSAxMDAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKGQgLyAxMDAwKSArIFwia1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5zaG93Q2hhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGQzLnNlbGVjdChlbGVtZW50LmZpbmQoXCJzdmdcIilbMF0pLmRhdHVtKHNjb3BlLmRhdGEpLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyNTApLmNhbGwoc2NvcGUuY2hhcnQpO1xuICAgICAgfTtcbiAgICAgIHNjb3BlLmNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpLm9wdGlvbnMoc2NvcGUub3B0aW9ucykuc2hvd0xlZ2VuZChmYWxzZSkubWFyZ2luKHtcbiAgICAgICAgdG9wOiAxNSxcbiAgICAgICAgbGVmdDogNTAsXG4gICAgICAgIGJvdHRvbTogMzAsXG4gICAgICAgIHJpZ2h0OiAzMFxuICAgICAgfSk7XG4gICAgICBzY29wZS5jaGFydC55QXhpcy5zaG93TWF4TWluKGZhbHNlKTtcbiAgICAgIHNjb3BlLmNoYXJ0LnRvb2x0aXAuaGlkZURlbGF5KDApO1xuICAgICAgc2NvcGUuY2hhcnQudG9vbHRpcC5jb250ZW50R2VuZXJhdG9yKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gXCI8cD5cIiArIChkMy50aW1lLmZvcm1hdCgnJUg6JU06JVMnKShuZXcgRGF0ZShvYmoucG9pbnQueCkpKSArIFwiIHwgXCIgKyBvYmoucG9pbnQueSArIFwiPC9wPlwiO1xuICAgICAgfSk7XG4gICAgICBudi51dGlscy53aW5kb3dSZXNpemUoc2NvcGUuY2hhcnQudXBkYXRlKTtcbiAgICAgIHNjb3BlLnNldFNpemUgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgICAgIHJldHVybiBzY29wZS5zZXRNZXRyaWNTaXplKHNjb3BlLm1ldHJpYywgc2l6ZSk7XG4gICAgICB9O1xuICAgICAgc2NvcGUuc2hvd0NoYXJ0KCk7XG4gICAgICByZXR1cm4gc2NvcGUuJG9uKCdtZXRyaWNzOmRhdGE6dXBkYXRlJywgZnVuY3Rpb24oZXZlbnQsIHRpbWVzdGFtcCwgZGF0YSkge1xuICAgICAgICBzY29wZS52YWx1ZSA9IHBhcnNlSW50KGRhdGFbc2NvcGUubWV0cmljLmlkXSk7XG4gICAgICAgIHNjb3BlLmRhdGFbMF0udmFsdWVzLnB1c2goe1xuICAgICAgICAgIHg6IHRpbWVzdGFtcCxcbiAgICAgICAgICB5OiBzY29wZS52YWx1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNjb3BlLmRhdGFbMF0udmFsdWVzLmxlbmd0aCA+IHNjb3BlLndpbmRvdykge1xuICAgICAgICAgIHNjb3BlLmRhdGFbMF0udmFsdWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuc2hvd0NoYXJ0KCk7XG4gICAgICAgIHNjb3BlLmNoYXJ0LmNsZWFySGlnaGxpZ2h0cygpO1xuICAgICAgICByZXR1cm4gc2NvcGUuY2hhcnQudG9vbHRpcC5oaWRkZW4odHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnTWV0cmljc1NlcnZpY2UnLCAoJGh0dHAsICRxLCBmbGlua0NvbmZpZywgJGludGVydmFsKSAtPlxuICBjb25zb2xlLmxvZyAnTWV0cmljc1NlcnZpY2UnXG5cbiAgQG1ldHJpY3MgPSB7fVxuICBAdmFsdWVzID0ge31cbiAgQHdhdGNoZWQgPSB7fVxuICBAb2JzZXJ2ZXIgPSB7XG4gICAgam9iaWQ6IG51bGxcbiAgICBub2RlaWQ6IG51bGxcbiAgICBjYWxsYmFjazogbnVsbFxuICB9XG5cbiAgQHJlZnJlc2ggPSAkaW50ZXJ2YWwgPT5cbiAgICBhbmd1bGFyLmZvckVhY2ggQHdhdGNoZWQsICh2LCBqb2JpZCkgPT5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCB2LCAobm9kZWlkLCBuaykgPT5cbiAgICAgICAgQGdldEFsbEF2YWlsYWJsZU1ldHJpY3Moam9iaWQsIG5vZGVpZCkudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgICBuYW1lcyA9IFtdXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEsIChtZXRyaWMsIG1rKSA9PlxuICAgICAgICAgICAgbmFtZXMucHVzaCBtZXRyaWMuaWRcblxuICAgICAgICAgIEBnZXRNZXRyaWNzKGpvYmlkLCBub2RlaWQsIG5hbWVzKS50aGVuICh2YWx1ZXMpID0+XG4gICAgICAgICAgICBpZiBqb2JpZCA9PSBAb2JzZXJ2ZXIuam9iaWQgJiYgbm9kZWlkID09IEBvYnNlcnZlci5ub2RlaWRcbiAgICAgICAgICAgICAgQG9ic2VydmVyLmNhbGxiYWNrKHZhbHVlcykgaWYgQG9ic2VydmVyLmNhbGxiYWNrXG5cblxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gIEByZWdpc3Rlck9ic2VydmVyID0gKGpvYmlkLCBub2RlaWQsIGNhbGxiYWNrKSAtPlxuICAgIEBvYnNlcnZlci5qb2JpZCA9IGpvYmlkXG4gICAgQG9ic2VydmVyLm5vZGVpZCA9IG5vZGVpZFxuICAgIEBvYnNlcnZlci5jYWxsYmFjayA9IGNhbGxiYWNrXG5cbiAgQHVuUmVnaXN0ZXJPYnNlcnZlciA9IC0+XG4gICAgQG9ic2VydmVyID0ge1xuICAgICAgam9iaWQ6IG51bGxcbiAgICAgIG5vZGVpZDogbnVsbFxuICAgICAgY2FsbGJhY2s6IG51bGxcbiAgICB9XG5cbiAgQHNldHVwTWV0cmljcyA9IChqb2JpZCwgdmVydGljZXMpIC0+XG4gICAgQHNldHVwTFMoKVxuXG4gICAgQHdhdGNoZWRbam9iaWRdID0gW11cbiAgICBhbmd1bGFyLmZvckVhY2ggdmVydGljZXMsICh2LCBrKSA9PlxuICAgICAgQHdhdGNoZWRbam9iaWRdLnB1c2godi5pZCkgaWYgdi5pZFxuXG4gIEBnZXRXaW5kb3cgPSAtPlxuICAgIDEwMFxuXG4gIEBzZXR1cExTID0gLT5cbiAgICBpZiAhbG9jYWxTdG9yYWdlLmZsaW5rTWV0cmljcz9cbiAgICAgIEBzYXZlU2V0dXAoKVxuXG4gICAgQG1ldHJpY3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5mbGlua01ldHJpY3MpXG5cbiAgQHNhdmVTZXR1cCA9IC0+XG4gICAgbG9jYWxTdG9yYWdlLmZsaW5rTWV0cmljcyA9IEpTT04uc3RyaW5naWZ5KEBtZXRyaWNzKVxuXG4gIEBzYXZlVmFsdWUgPSAoam9iaWQsIG5vZGVpZCwgdmFsdWUpIC0+XG4gICAgdW5sZXNzIEB2YWx1ZXNbam9iaWRdP1xuICAgICAgQHZhbHVlc1tqb2JpZF0gPSB7fVxuXG4gICAgdW5sZXNzIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0/XG4gICAgICBAdmFsdWVzW2pvYmlkXVtub2RlaWRdID0gW11cblxuICAgIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0ucHVzaCh2YWx1ZSlcblxuICAgIGlmIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0ubGVuZ3RoID4gQGdldFdpbmRvdygpXG4gICAgICBAdmFsdWVzW2pvYmlkXVtub2RlaWRdLnNoaWZ0KClcblxuICBAZ2V0VmFsdWVzID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSAtPlxuICAgIHJldHVybiBbXSB1bmxlc3MgQHZhbHVlc1tqb2JpZF0/XG4gICAgcmV0dXJuIFtdIHVubGVzcyBAdmFsdWVzW2pvYmlkXVtub2RlaWRdP1xuXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgYW5ndWxhci5mb3JFYWNoIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0sICh2LCBrKSA9PlxuICAgICAgaWYgdi52YWx1ZXNbbWV0cmljaWRdP1xuICAgICAgICByZXN1bHRzLnB1c2gge1xuICAgICAgICAgIHg6IHYudGltZXN0YW1wXG4gICAgICAgICAgeTogdi52YWx1ZXNbbWV0cmljaWRdXG4gICAgICAgIH1cblxuICAgIHJlc3VsdHNcblxuICBAc2V0dXBMU0ZvciA9IChqb2JpZCwgbm9kZWlkKSAtPlxuICAgIGlmICFAbWV0cmljc1tqb2JpZF0/XG4gICAgICBAbWV0cmljc1tqb2JpZF0gPSB7fVxuXG4gICAgaWYgIUBtZXRyaWNzW2pvYmlkXVtub2RlaWRdP1xuICAgICAgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0gPSBbXVxuXG4gIEBhZGRNZXRyaWMgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljaWQpIC0+XG4gICAgQHNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZClcblxuICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLnB1c2goe2lkOiBtZXRyaWNpZCwgc2l6ZTogJ3NtYWxsJ30pXG5cbiAgICBAc2F2ZVNldHVwKClcblxuICBAcmVtb3ZlTWV0cmljID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpYykgPT5cbiAgICBpZiBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXT9cbiAgICAgIGkgPSBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5pbmRleE9mKG1ldHJpYylcbiAgICAgIGkgPSBfLmZpbmRJbmRleChAbWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgeyBpZDogbWV0cmljIH0pIGlmIGkgPT0gLTFcblxuICAgICAgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uc3BsaWNlKGksIDEpIGlmIGkgIT0gLTFcblxuICAgICAgQHNhdmVTZXR1cCgpXG5cbiAgQHNldE1ldHJpY1NpemUgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljLCBzaXplKSA9PlxuICAgIGlmIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdP1xuICAgICAgaSA9IEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljLmlkKVxuICAgICAgaSA9IF8uZmluZEluZGV4KEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7IGlkOiBtZXRyaWMuaWQgfSkgaWYgaSA9PSAtMVxuXG4gICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXVtpXSA9IHsgaWQ6IG1ldHJpYy5pZCwgc2l6ZTogc2l6ZSB9IGlmIGkgIT0gLTFcblxuICAgICAgQHNhdmVTZXR1cCgpXG5cbiAgQG9yZGVyTWV0cmljcyA9IChqb2JpZCwgbm9kZWlkLCBpdGVtLCBpbmRleCkgLT5cbiAgICBAc2V0dXBMU0Zvcihqb2JpZCwgbm9kZWlkKVxuXG4gICAgYW5ndWxhci5mb3JFYWNoIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCAodiwgaykgPT5cbiAgICAgIGlmIHYuaWQgPT0gaXRlbS5pZFxuICAgICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaywgMSlcbiAgICAgICAgaWYgayA8IGluZGV4XG4gICAgICAgICAgaW5kZXggPSBpbmRleCAtIDFcblxuICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShpbmRleCwgMCwgaXRlbSlcblxuICAgIEBzYXZlU2V0dXAoKVxuXG4gIEBnZXRNZXRyaWNzU2V0dXAgPSAoam9iaWQsIG5vZGVpZCkgPT5cbiAgICB7XG4gICAgICBuYW1lczogXy5tYXAoQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0sICh2YWx1ZSkgPT5cbiAgICAgICAgaWYgXy5pc1N0cmluZyh2YWx1ZSkgdGhlbiB7IGlkOiB2YWx1ZSwgc2l6ZTogXCJzbWFsbFwiIH0gZWxzZSB2YWx1ZVxuICAgICAgKVxuICAgIH1cblxuICBAZ2V0QXZhaWxhYmxlTWV0cmljcyA9IChqb2JpZCwgbm9kZWlkKSA9PlxuICAgIEBzZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpXG5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljc1wiXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICByZXN1bHRzID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLmF2YWlsYWJsZSwgKHYsIGspID0+XG4gICAgICAgIGkgPSBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5pbmRleE9mKHYuaWQpXG4gICAgICAgIGkgPSBfLmZpbmRJbmRleChAbWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgeyBpZDogdi5pZCB9KSBpZiBpID09IC0xXG5cbiAgICAgICAgaWYgaSA9PSAtMVxuICAgICAgICAgIHJlc3VsdHMucHVzaCh2KVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldEFsbEF2YWlsYWJsZU1ldHJpY3MgPSAoam9iaWQsIG5vZGVpZCkgPT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljc1wiXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldE1ldHJpY3MgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljSWRzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgaWRzID0gbWV0cmljSWRzLmpvaW4oXCIsXCIpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3M/Z2V0PVwiICsgaWRzXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICByZXN1bHQgPSB7fVxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEsICh2LCBrKSAtPlxuICAgICAgICByZXN1bHRbdi5pZF0gPSBwYXJzZUludCh2LnZhbHVlKVxuXG4gICAgICBuZXdWYWx1ZSA9IHtcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIHZhbHVlczogcmVzdWx0XG4gICAgICB9XG4gICAgICBAc2F2ZVZhbHVlKGpvYmlkLCBub2RlaWQsIG5ld1ZhbHVlKVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShuZXdWYWx1ZSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAc2V0dXBMUygpXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnTWV0cmljc1NlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgJHEsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwpIHtcbiAgY29uc29sZS5sb2coJ01ldHJpY3NTZXJ2aWNlJyk7XG4gIHRoaXMubWV0cmljcyA9IHt9O1xuICB0aGlzLnZhbHVlcyA9IHt9O1xuICB0aGlzLndhdGNoZWQgPSB7fTtcbiAgdGhpcy5vYnNlcnZlciA9IHtcbiAgICBqb2JpZDogbnVsbCxcbiAgICBub2RlaWQ6IG51bGwsXG4gICAgY2FsbGJhY2s6IG51bGxcbiAgfTtcbiAgdGhpcy5yZWZyZXNoID0gJGludGVydmFsKChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2goX3RoaXMud2F0Y2hlZCwgZnVuY3Rpb24odiwgam9iaWQpIHtcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaCh2LCBmdW5jdGlvbihub2RlaWQsIG5rKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmdldEFsbEF2YWlsYWJsZU1ldHJpY3Moam9iaWQsIG5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgbmFtZXM7XG4gICAgICAgICAgICBuYW1lcyA9IFtdO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKG1ldHJpYywgbWspIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5hbWVzLnB1c2gobWV0cmljLmlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmdldE1ldHJpY3Moam9iaWQsIG5vZGVpZCwgbmFtZXMpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgIGlmIChqb2JpZCA9PT0gX3RoaXMub2JzZXJ2ZXIuam9iaWQgJiYgbm9kZWlkID09PSBfdGhpcy5vYnNlcnZlci5ub2RlaWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMub2JzZXJ2ZXIuY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5vYnNlcnZlci5jYWxsYmFjayh2YWx1ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSkodGhpcyksIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIHRoaXMucmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vYnNlcnZlci5qb2JpZCA9IGpvYmlkO1xuICAgIHRoaXMub2JzZXJ2ZXIubm9kZWlkID0gbm9kZWlkO1xuICAgIHJldHVybiB0aGlzLm9ic2VydmVyLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gIH07XG4gIHRoaXMudW5SZWdpc3Rlck9ic2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2ZXIgPSB7XG4gICAgICBqb2JpZDogbnVsbCxcbiAgICAgIG5vZGVpZDogbnVsbCxcbiAgICAgIGNhbGxiYWNrOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgdGhpcy5zZXR1cE1ldHJpY3MgPSBmdW5jdGlvbihqb2JpZCwgdmVydGljZXMpIHtcbiAgICB0aGlzLnNldHVwTFMoKTtcbiAgICB0aGlzLndhdGNoZWRbam9iaWRdID0gW107XG4gICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaCh2ZXJ0aWNlcywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odiwgaykge1xuICAgICAgICBpZiAodi5pZCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy53YXRjaGVkW2pvYmlkXS5wdXNoKHYuaWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcbiAgdGhpcy5nZXRXaW5kb3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gMTAwO1xuICB9O1xuICB0aGlzLnNldHVwTFMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmZsaW5rTWV0cmljcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLnNhdmVTZXR1cCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZmxpbmtNZXRyaWNzKTtcbiAgfTtcbiAgdGhpcy5zYXZlU2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmZsaW5rTWV0cmljcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWV0cmljcyk7XG4gIH07XG4gIHRoaXMuc2F2ZVZhbHVlID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgdmFsdWUpIHtcbiAgICBpZiAodGhpcy52YWx1ZXNbam9iaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMudmFsdWVzW2pvYmlkXSA9IHt9O1xuICAgIH1cbiAgICBpZiAodGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0ucHVzaCh2YWx1ZSk7XG4gICAgaWYgKHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdLmxlbmd0aCA+IHRoaXMuZ2V0V2luZG93KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXS5zaGlmdCgpO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5nZXRWYWx1ZXMgPSBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBtZXRyaWNpZCkge1xuICAgIHZhciByZXN1bHRzO1xuICAgIGlmICh0aGlzLnZhbHVlc1tqb2JpZF0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAodGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXN1bHRzID0gW107XG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIGlmICh2LnZhbHVlc1ttZXRyaWNpZF0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgeDogdi50aW1lc3RhbXAsXG4gICAgICAgICAgICB5OiB2LnZhbHVlc1ttZXRyaWNpZF1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG4gIHRoaXMuc2V0dXBMU0ZvciA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQpIHtcbiAgICBpZiAodGhpcy5tZXRyaWNzW2pvYmlkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLm1ldHJpY3Nbam9iaWRdID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSA9IFtdO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5hZGRNZXRyaWMgPSBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBtZXRyaWNpZCkge1xuICAgIHRoaXMuc2V0dXBMU0Zvcihqb2JpZCwgbm9kZWlkKTtcbiAgICB0aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0ucHVzaCh7XG4gICAgICBpZDogbWV0cmljaWQsXG4gICAgICBzaXplOiAnc21hbGwnXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc2F2ZVNldHVwKCk7XG4gIH07XG4gIHRoaXMucmVtb3ZlTWV0cmljID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpYykge1xuICAgICAgdmFyIGk7XG4gICAgICBpZiAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSAhPSBudWxsKSB7XG4gICAgICAgIGkgPSBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljKTtcbiAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgaSA9IF8uZmluZEluZGV4KF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHtcbiAgICAgICAgICAgIGlkOiBtZXRyaWNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuc2F2ZVNldHVwKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHRoaXMuc2V0TWV0cmljU2l6ZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBtZXRyaWMsIHNpemUpIHtcbiAgICAgIHZhciBpO1xuICAgICAgaWYgKF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0gIT0gbnVsbCkge1xuICAgICAgICBpID0gX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5pbmRleE9mKG1ldHJpYy5pZCk7XG4gICAgICAgIGlmIChpID09PSAtMSkge1xuICAgICAgICAgIGkgPSBfLmZpbmRJbmRleChfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7XG4gICAgICAgICAgICBpZDogbWV0cmljLmlkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICAgICAgX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXVtpXSA9IHtcbiAgICAgICAgICAgIGlkOiBtZXRyaWMuaWQsXG4gICAgICAgICAgICBzaXplOiBzaXplXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuc2F2ZVNldHVwKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHRoaXMub3JkZXJNZXRyaWNzID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgaXRlbSwgaW5kZXgpIHtcbiAgICB0aGlzLnNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZCk7XG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odiwgaykge1xuICAgICAgICBpZiAodi5pZCA9PT0gaXRlbS5pZCkge1xuICAgICAgICAgIF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uc3BsaWNlKGssIDEpO1xuICAgICAgICAgIGlmIChrIDwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA9IGluZGV4IC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaW5kZXgsIDAsIGl0ZW0pO1xuICAgIHJldHVybiB0aGlzLnNhdmVTZXR1cCgpO1xuICB9O1xuICB0aGlzLmdldE1ldHJpY3NTZXR1cCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihqb2JpZCwgbm9kZWlkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lczogXy5tYXAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGlkOiB2YWx1ZSxcbiAgICAgICAgICAgICAgc2l6ZTogXCJzbWFsbFwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRBdmFpbGFibGVNZXRyaWNzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIF90aGlzLnNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZCk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3NcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLmF2YWlsYWJsZSwgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgIHZhciBpO1xuICAgICAgICAgIGkgPSBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2Yodi5pZCk7XG4gICAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgICBpID0gXy5maW5kSW5kZXgoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwge1xuICAgICAgICAgICAgICBpZDogdi5pZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMucHVzaCh2KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHRoaXMuZ2V0QWxsQXZhaWxhYmxlTWV0cmljcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihqb2JpZCwgbm9kZWlkKSB7XG4gICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3NcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRNZXRyaWNzID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgbWV0cmljSWRzKSB7XG4gICAgdmFyIGRlZmVycmVkLCBpZHM7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGlkcyA9IG1ldHJpY0lkcy5qb2luKFwiLFwiKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3M/Z2V0PVwiICsgaWRzKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlLCByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgIHJldHVybiByZXN1bHRbdi5pZF0gPSBwYXJzZUludCh2LnZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG5ld1ZhbHVlID0ge1xuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB2YWx1ZXM6IHJlc3VsdFxuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5zYXZlVmFsdWUoam9iaWQsIG5vZGVpZCwgbmV3VmFsdWUpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShuZXdWYWx1ZSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5zZXR1cExTKCk7XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ092ZXJ2aWV3Q29udHJvbGxlcicsICgkc2NvcGUsIE92ZXJ2aWV3U2VydmljZSwgSm9ic1NlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIC0+XG4gICRzY29wZS5qb2JPYnNlcnZlciA9IC0+XG4gICAgJHNjb3BlLnJ1bm5pbmdKb2JzID0gSm9ic1NlcnZpY2UuZ2V0Sm9icygncnVubmluZycpXG4gICAgJHNjb3BlLmZpbmlzaGVkSm9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJylcblxuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG5cbiAgJHNjb3BlLmpvYk9ic2VydmVyKClcblxuICBPdmVydmlld1NlcnZpY2UubG9hZE92ZXJ2aWV3KCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUub3ZlcnZpZXcgPSBkYXRhXG5cbiAgcmVmcmVzaCA9ICRpbnRlcnZhbCAtPlxuICAgIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YVxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5jb250cm9sbGVyKCdPdmVydmlld0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIE92ZXJ2aWV3U2VydmljZSwgSm9ic1NlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIHtcbiAgdmFyIHJlZnJlc2g7XG4gICRzY29wZS5qb2JPYnNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5ydW5uaW5nSm9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKTtcbiAgICByZXR1cm4gJHNjb3BlLmZpbmlzaGVkSm9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJyk7XG4gIH07XG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gIH0pO1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIoKTtcbiAgT3ZlcnZpZXdTZXJ2aWNlLmxvYWRPdmVydmlldygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiAkc2NvcGUub3ZlcnZpZXcgPSBkYXRhO1xuICB9KTtcbiAgcmVmcmVzaCA9ICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gT3ZlcnZpZXdTZXJ2aWNlLmxvYWRPdmVydmlldygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5vdmVydmlldyA9IGRhdGE7XG4gICAgfSk7XG4gIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpO1xuICB9KTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdPdmVydmlld1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgb3ZlcnZpZXcgPSB7fVxuXG4gIEBsb2FkT3ZlcnZpZXcgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwib3ZlcnZpZXdcIilcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBvdmVydmlldyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdPdmVydmlld1NlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgZmxpbmtDb25maWcsICRxKSB7XG4gIHZhciBvdmVydmlldztcbiAgb3ZlcnZpZXcgPSB7fTtcbiAgdGhpcy5sb2FkT3ZlcnZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcIm92ZXJ2aWV3XCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIG92ZXJ2aWV3ID0gZGF0YTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdKb2JTdWJtaXRDb250cm9sbGVyJywgKCRzY29wZSwgSm9iU3VibWl0U2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZywgJHN0YXRlLCAkbG9jYXRpb24pIC0+XG4gICRzY29wZS55YXJuID0gJGxvY2F0aW9uLmFic1VybCgpLmluZGV4T2YoXCIvcHJveHkvYXBwbGljYXRpb25fXCIpICE9IC0xXG4gICRzY29wZS5sb2FkTGlzdCA9ICgpIC0+XG4gICAgSm9iU3VibWl0U2VydmljZS5sb2FkSmFyTGlzdCgpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuYWRkcmVzcyA9IGRhdGEuYWRkcmVzc1xuICAgICAgJHNjb3BlLm5vYWNjZXNzID0gZGF0YS5lcnJvclxuICAgICAgJHNjb3BlLmphcnMgPSBkYXRhLmZpbGVzXG5cbiAgJHNjb3BlLmRlZmF1bHRTdGF0ZSA9ICgpIC0+XG4gICAgJHNjb3BlLnBsYW4gPSBudWxsXG4gICAgJHNjb3BlLmVycm9yID0gbnVsbFxuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGVkOiBudWxsLFxuICAgICAgcGFyYWxsZWxpc206IFwiXCIsXG4gICAgICAnZW50cnktY2xhc3MnOiBcIlwiLFxuICAgICAgJ3Byb2dyYW0tYXJncyc6IFwiXCIsXG4gICAgICAncGxhbi1idXR0b24nOiBcIlNob3cgUGxhblwiLFxuICAgICAgJ3N1Ym1pdC1idXR0b24nOiBcIlN1Ym1pdFwiLFxuICAgICAgJ2FjdGlvbi10aW1lJzogMFxuICAgIH1cblxuICAkc2NvcGUuZGVmYXVsdFN0YXRlKClcbiAgJHNjb3BlLnVwbG9hZGVyID0ge31cbiAgJHNjb3BlLmxvYWRMaXN0KClcblxuICByZWZyZXNoID0gJGludGVydmFsIC0+XG4gICAgJHNjb3BlLmxvYWRMaXN0KClcbiAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgJGludGVydmFsLmNhbmNlbChyZWZyZXNoKVxuXG4gICRzY29wZS5zZWxlY3RKYXIgPSAoaWQpIC0+XG4gICAgaWYgJHNjb3BlLnN0YXRlLnNlbGVjdGVkID09IGlkXG4gICAgICAkc2NvcGUuZGVmYXVsdFN0YXRlKClcbiAgICBlbHNlXG4gICAgICAkc2NvcGUuZGVmYXVsdFN0YXRlKClcbiAgICAgICRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9IGlkXG5cbiAgJHNjb3BlLmRlbGV0ZUphciA9IChldmVudCwgaWQpIC0+XG4gICAgaWYgJHNjb3BlLnN0YXRlLnNlbGVjdGVkID09IGlkXG4gICAgICAkc2NvcGUuZGVmYXVsdFN0YXRlKClcbiAgICBhbmd1bGFyLmVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJmYS1yZW1vdmVcIikuYWRkQ2xhc3MoXCJmYS1zcGluIGZhLXNwaW5uZXJcIilcbiAgICBKb2JTdWJtaXRTZXJ2aWNlLmRlbGV0ZUphcihpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgIGFuZ3VsYXIuZWxlbWVudChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3Bpbm5lclwiKS5hZGRDbGFzcyhcImZhLXJlbW92ZVwiKVxuICAgICAgaWYgZGF0YS5lcnJvcj9cbiAgICAgICAgYWxlcnQoZGF0YS5lcnJvcilcblxuICAkc2NvcGUubG9hZEVudHJ5Q2xhc3MgPSAobmFtZSkgLT5cbiAgICAkc2NvcGUuc3RhdGVbJ2VudHJ5LWNsYXNzJ10gPSBuYW1lXG5cbiAgJHNjb3BlLmdldFBsYW4gPSAoKSAtPlxuICAgIGlmICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9PSBcIlNob3cgUGxhblwiXG4gICAgICBhY3Rpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgICAgJHNjb3BlLnN0YXRlWydhY3Rpb24tdGltZSddID0gYWN0aW9uXG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCJcbiAgICAgICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9IFwiR2V0dGluZyBQbGFuXCJcbiAgICAgICRzY29wZS5lcnJvciA9IG51bGxcbiAgICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICAgSm9iU3VibWl0U2VydmljZS5nZXRQbGFuKFxuICAgICAgICAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQsIHtcbiAgICAgICAgICAnZW50cnktY2xhc3MnOiAkc2NvcGUuc3RhdGVbJ2VudHJ5LWNsYXNzJ10sXG4gICAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgICAncHJvZ3JhbS1hcmdzJzogJHNjb3BlLnN0YXRlWydwcm9ncmFtLWFyZ3MnXVxuICAgICAgICB9XG4gICAgICApLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgIGlmIGFjdGlvbiA9PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ11cbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiXG4gICAgICAgICAgJHNjb3BlLmVycm9yID0gZGF0YS5lcnJvclxuICAgICAgICAgICRzY29wZS5wbGFuID0gZGF0YS5wbGFuXG5cbiAgJHNjb3BlLnJ1bkpvYiA9ICgpIC0+XG4gICAgaWYgJHNjb3BlLnN0YXRlWydzdWJtaXQtYnV0dG9uJ10gPT0gXCJTdWJtaXRcIlxuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICAgICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXSA9IGFjdGlvblxuICAgICAgJHNjb3BlLnN0YXRlWydzdWJtaXQtYnV0dG9uJ10gPSBcIlN1Ym1pdHRpbmdcIlxuICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJTaG93IFBsYW5cIlxuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbFxuICAgICAgSm9iU3VibWl0U2VydmljZS5ydW5Kb2IoXG4gICAgICAgICRzY29wZS5zdGF0ZS5zZWxlY3RlZCwge1xuICAgICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgICBwYXJhbGxlbGlzbTogJHNjb3BlLnN0YXRlLnBhcmFsbGVsaXNtLFxuICAgICAgICAgICdwcm9ncmFtLWFyZ3MnOiAkc2NvcGUuc3RhdGVbJ3Byb2dyYW0tYXJncyddXG4gICAgICAgIH1cbiAgICAgICkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgaWYgYWN0aW9uID09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXVxuICAgICAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIlxuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3JcbiAgICAgICAgICBpZiBkYXRhLmpvYmlkP1xuICAgICAgICAgICAgJHN0YXRlLmdvKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtqb2JpZDogZGF0YS5qb2JpZH0pXG5cbiAgIyBqb2IgcGxhbiBkaXNwbGF5IHJlbGF0ZWQgc3R1ZmZcbiAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSAobm9kZWlkKSAtPlxuICAgIGlmIG5vZGVpZCAhPSAkc2NvcGUubm9kZWlkXG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkXG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcblxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAgIGVsc2VcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2VcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuXG4gICRzY29wZS5jbGVhckZpbGVzID0gKCkgLT5cbiAgICAkc2NvcGUudXBsb2FkZXIgPSB7fVxuXG4gICRzY29wZS51cGxvYWRGaWxlcyA9IChmaWxlcykgLT5cbiAgICAjIG1ha2Ugc3VyZSBldmVyeXRoaW5nIGlzIGNsZWFyIGFnYWluLlxuICAgICRzY29wZS51cGxvYWRlciA9IHt9XG4gICAgaWYgZmlsZXMubGVuZ3RoID09IDFcbiAgICAgICRzY29wZS51cGxvYWRlclsnZmlsZSddID0gZmlsZXNbMF1cbiAgICAgICRzY29wZS51cGxvYWRlclsndXBsb2FkJ10gPSB0cnVlXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gXCJEaWQgeWEgZm9yZ2V0IHRvIHNlbGVjdCBhIGZpbGU/XCJcblxuICAkc2NvcGUuc3RhcnRVcGxvYWQgPSAoKSAtPlxuICAgIGlmICRzY29wZS51cGxvYWRlclsnZmlsZSddP1xuICAgICAgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZm9ybWRhdGEuYXBwZW5kKFwiamFyZmlsZVwiLCAkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXSlcbiAgICAgICRzY29wZS51cGxvYWRlclsndXBsb2FkJ10gPSBmYWxzZVxuICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIkluaXRpYWxpemluZyB1cGxvYWQuLi5cIlxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsXG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IHBhcnNlSW50KDEwMCAqIGV2ZW50LmxvYWRlZCAvIGV2ZW50LnRvdGFsKVxuICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gKGV2ZW50KSAtPlxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3Byb2dyZXNzJ10gPSBudWxsXG4gICAgICAgICRzY29wZS51cGxvYWRlclsnZXJyb3InXSA9IFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdXBsb2FkaW5nIHlvdXIgZmlsZVwiXG4gICAgICB4aHIudXBsb2FkLm9ubG9hZCA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gbnVsbFxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiU2F2aW5nLi4uXCJcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgICAgICBpZiB4aHIucmVhZHlTdGF0ZSA9PSA0XG4gICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3I/XG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSByZXNwb25zZS5lcnJvclxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlVwbG9hZGVkIVwiXG4gICAgICB4aHIub3BlbihcIlBPU1RcIiwgXCIvamFycy91cGxvYWRcIilcbiAgICAgIHhoci5zZW5kKGZvcm1kYXRhKVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBFcnJvci4gVGhpcyBzaG91bGQgbm90IGhhcHBlblwiKVxuXG4uZmlsdGVyICdnZXRKYXJTZWxlY3RDbGFzcycsIC0+XG4gIChzZWxlY3RlZCwgYWN0dWFsKSAtPlxuICAgIGlmIHNlbGVjdGVkID09IGFjdHVhbFxuICAgICAgXCJmYS1jaGVjay1zcXVhcmVcIlxuICAgIGVsc2VcbiAgICAgIFwiZmEtc3F1YXJlLW9cIlxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignSm9iU3VibWl0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9iU3VibWl0U2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZywgJHN0YXRlLCAkbG9jYXRpb24pIHtcbiAgdmFyIHJlZnJlc2g7XG4gICRzY29wZS55YXJuID0gJGxvY2F0aW9uLmFic1VybCgpLmluZGV4T2YoXCIvcHJveHkvYXBwbGljYXRpb25fXCIpICE9PSAtMTtcbiAgJHNjb3BlLmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYlN1Ym1pdFNlcnZpY2UubG9hZEphckxpc3QoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5hZGRyZXNzID0gZGF0YS5hZGRyZXNzO1xuICAgICAgJHNjb3BlLm5vYWNjZXNzID0gZGF0YS5lcnJvcjtcbiAgICAgIHJldHVybiAkc2NvcGUuamFycyA9IGRhdGEuZmlsZXM7XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS5kZWZhdWx0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucGxhbiA9IG51bGw7XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICByZXR1cm4gJHNjb3BlLnN0YXRlID0ge1xuICAgICAgc2VsZWN0ZWQ6IG51bGwsXG4gICAgICBwYXJhbGxlbGlzbTogXCJcIixcbiAgICAgICdlbnRyeS1jbGFzcyc6IFwiXCIsXG4gICAgICAncHJvZ3JhbS1hcmdzJzogXCJcIixcbiAgICAgICdwbGFuLWJ1dHRvbic6IFwiU2hvdyBQbGFuXCIsXG4gICAgICAnc3VibWl0LWJ1dHRvbic6IFwiU3VibWl0XCIsXG4gICAgICAnYWN0aW9uLXRpbWUnOiAwXG4gICAgfTtcbiAgfTtcbiAgJHNjb3BlLmRlZmF1bHRTdGF0ZSgpO1xuICAkc2NvcGUudXBsb2FkZXIgPSB7fTtcbiAgJHNjb3BlLmxvYWRMaXN0KCk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5sb2FkTGlzdCgpO1xuICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpO1xuICB9KTtcbiAgJHNjb3BlLnNlbGVjdEphciA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgaWYgKCRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9PT0gaWQpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuZGVmYXVsdFN0YXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgICAgIHJldHVybiAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPSBpZDtcbiAgICB9XG4gIH07XG4gICRzY29wZS5kZWxldGVKYXIgPSBmdW5jdGlvbihldmVudCwgaWQpIHtcbiAgICBpZiAoJHNjb3BlLnN0YXRlLnNlbGVjdGVkID09PSBpZCkge1xuICAgICAgJHNjb3BlLmRlZmF1bHRTdGF0ZSgpO1xuICAgIH1cbiAgICBhbmd1bGFyLmVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJmYS1yZW1vdmVcIikuYWRkQ2xhc3MoXCJmYS1zcGluIGZhLXNwaW5uZXJcIik7XG4gICAgcmV0dXJuIEpvYlN1Ym1pdFNlcnZpY2UuZGVsZXRlSmFyKGlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3Bpbm5lclwiKS5hZGRDbGFzcyhcImZhLXJlbW92ZVwiKTtcbiAgICAgIGlmIChkYXRhLmVycm9yICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGFsZXJ0KGRhdGEuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUubG9hZEVudHJ5Q2xhc3MgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSA9IG5hbWU7XG4gIH07XG4gICRzY29wZS5nZXRQbGFuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdGlvbjtcbiAgICBpZiAoJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID09PSBcIlNob3cgUGxhblwiKSB7XG4gICAgICBhY3Rpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXSA9IGFjdGlvbjtcbiAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIjtcbiAgICAgICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9IFwiR2V0dGluZyBQbGFuXCI7XG4gICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICAgJHNjb3BlLnBsYW4gPSBudWxsO1xuICAgICAgcmV0dXJuIEpvYlN1Ym1pdFNlcnZpY2UuZ2V0UGxhbigkc2NvcGUuc3RhdGUuc2VsZWN0ZWQsIHtcbiAgICAgICAgJ2VudHJ5LWNsYXNzJzogJHNjb3BlLnN0YXRlWydlbnRyeS1jbGFzcyddLFxuICAgICAgICBwYXJhbGxlbGlzbTogJHNjb3BlLnN0YXRlLnBhcmFsbGVsaXNtLFxuICAgICAgICAncHJvZ3JhbS1hcmdzJzogJHNjb3BlLnN0YXRlWydwcm9ncmFtLWFyZ3MnXVxuICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXSkge1xuICAgICAgICAgICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9IFwiU2hvdyBQbGFuXCI7XG4gICAgICAgICAgJHNjb3BlLmVycm9yID0gZGF0YS5lcnJvcjtcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLnBsYW4gPSBkYXRhLnBsYW47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLnJ1bkpvYiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3Rpb247XG4gICAgaWYgKCRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID09PSBcIlN1Ym1pdFwiKSB7XG4gICAgICBhY3Rpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXSA9IGFjdGlvbjtcbiAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXR0aW5nXCI7XG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiO1xuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLnJ1bkpvYigkc2NvcGUuc3RhdGUuc2VsZWN0ZWQsIHtcbiAgICAgICAgJ2VudHJ5LWNsYXNzJzogJHNjb3BlLnN0YXRlWydlbnRyeS1jbGFzcyddLFxuICAgICAgICBwYXJhbGxlbGlzbTogJHNjb3BlLnN0YXRlLnBhcmFsbGVsaXNtLFxuICAgICAgICAncHJvZ3JhbS1hcmdzJzogJHNjb3BlLnN0YXRlWydwcm9ncmFtLWFyZ3MnXVxuICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXSkge1xuICAgICAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIjtcbiAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBkYXRhLmVycm9yO1xuICAgICAgICAgIGlmIChkYXRhLmpvYmlkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAkc3RhdGUuZ28oXCJzaW5nbGUtam9iLnBsYW4uc3VidGFza3NcIiwge1xuICAgICAgICAgICAgICBqb2JpZDogZGF0YS5qb2JpZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5ub2RlaWQgPSBudWxsO1xuICAkc2NvcGUuY2hhbmdlTm9kZSA9IGZ1bmN0aW9uKG5vZGVpZCkge1xuICAgIGlmIChub2RlaWQgIT09ICRzY29wZS5ub2RlaWQpIHtcbiAgICAgICRzY29wZS5ub2RlaWQgPSBub2RlaWQ7XG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbDtcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdCgncmVsb2FkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsO1xuICAgICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGw7XG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsO1xuICAgICAgcmV0dXJuICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmNsZWFyRmlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyID0ge307XG4gIH07XG4gICRzY29wZS51cGxvYWRGaWxlcyA9IGZ1bmN0aW9uKGZpbGVzKSB7XG4gICAgJHNjb3BlLnVwbG9hZGVyID0ge307XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10gPSBmaWxlc1swXTtcbiAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3VwbG9hZCddID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICRzY29wZS51cGxvYWRlclsnZXJyb3InXSA9IFwiRGlkIHlhIGZvcmdldCB0byBzZWxlY3QgYSBmaWxlP1wiO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuICRzY29wZS5zdGFydFVwbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmb3JtZGF0YSwgeGhyO1xuICAgIGlmICgkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXSAhPSBudWxsKSB7XG4gICAgICBmb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgZm9ybWRhdGEuYXBwZW5kKFwiamFyZmlsZVwiLCAkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXSk7XG4gICAgICAkc2NvcGUudXBsb2FkZXJbJ3VwbG9hZCddID0gZmFsc2U7XG4gICAgICAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiSW5pdGlhbGl6aW5nIHVwbG9hZC4uLlwiO1xuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3Byb2dyZXNzJ10gPSBwYXJzZUludCgxMDAgKiBldmVudC5sb2FkZWQgLyBldmVudC50b3RhbCk7XG4gICAgICB9O1xuICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gbnVsbDtcbiAgICAgICAgcmV0dXJuICRzY29wZS51cGxvYWRlclsnZXJyb3InXSA9IFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdXBsb2FkaW5nIHlvdXIgZmlsZVwiO1xuICAgICAgfTtcbiAgICAgIHhoci51cGxvYWQub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gbnVsbDtcbiAgICAgICAgcmV0dXJuICRzY29wZS51cGxvYWRlclsnc3VjY2VzcyddID0gXCJTYXZpbmcuLi5cIjtcbiAgICAgIH07XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXNwb25zZTtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIGlmIChyZXNwb25zZS5lcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSByZXNwb25zZS5lcnJvcjtcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiVXBsb2FkZWQhXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgeGhyLm9wZW4oXCJQT1NUXCIsIFwiL2phcnMvdXBsb2FkXCIpO1xuICAgICAgcmV0dXJuIHhoci5zZW5kKGZvcm1kYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBFcnJvci4gVGhpcyBzaG91bGQgbm90IGhhcHBlblwiKTtcbiAgICB9XG4gIH07XG59KS5maWx0ZXIoJ2dldEphclNlbGVjdENsYXNzJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihzZWxlY3RlZCwgYWN0dWFsKSB7XG4gICAgaWYgKHNlbGVjdGVkID09PSBhY3R1YWwpIHtcbiAgICAgIHJldHVybiBcImZhLWNoZWNrLXNxdWFyZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJmYS1zcXVhcmUtb1wiO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JTdWJtaXRTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG5cbiAgQGxvYWRKYXJMaXN0ID0gKCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChcImphcnMvXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBkZWxldGVKYXIgPSAoaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5kZWxldGUoXCJqYXJzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KGlkKSlcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRQbGFuID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9wbGFuXCIsIHtwYXJhbXM6IGFyZ3N9KVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAcnVuSm9iID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAucG9zdChcImphcnMvXCIgKyBlbmNvZGVVUklDb21wb25lbnQoaWQpICsgXCIvcnVuXCIsIHt9LCB7cGFyYW1zOiBhcmdzfSlcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnSm9iU3VibWl0U2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkSmFyTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KFwiamFycy9cIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZGVsZXRlSmFyID0gZnVuY3Rpb24oaWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwW1wiZGVsZXRlXCJdKFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldFBsYW4gPSBmdW5jdGlvbihpZCwgYXJncykge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9wbGFuXCIsIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLnJ1bkpvYiA9IGZ1bmN0aW9uKGlkLCBhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5wb3N0KFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9ydW5cIiwge30sIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdBbGxUYXNrTWFuYWdlcnNDb250cm9sbGVyJywgKCRzY29wZSwgVGFza01hbmFnZXJzU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5tYW5hZ2VycyA9IGRhdGFcblxuICByZWZyZXNoID0gJGludGVydmFsIC0+XG4gICAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLm1hbmFnZXJzID0gZGF0YVxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlckNvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLm1ldHJpY3MgPSB7fVxuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZE1ldHJpY3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUubWV0cmljcyA9IGRhdGFbMF1cblxuICAgIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICAgIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTWV0cmljcygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdXG4gICAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAgICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaClcblxuLmNvbnRyb2xsZXIgJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLmxvZyA9IHt9XG4gIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTG9ncygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUubG9nID0gZGF0YVxuXG4gICRzY29wZS5yZWxvYWREYXRhID0gKCkgLT5cbiAgICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZExvZ3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUubG9nID0gZGF0YVxuXG4gICRzY29wZS5kb3dubG9hZERhdGEgPSAoKSAtPlxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvdGFza21hbmFnZXJzL1wiICsgKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKSArIFwiL2xvZ1wiXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLnN0ZG91dCA9IHt9XG4gIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkU3Rkb3V0KCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5zdGRvdXQgPSBkYXRhXG5cbiAgJHNjb3BlLnJlbG9hZERhdGEgPSAoKSAtPlxuICAgIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkU3Rkb3V0KCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLnN0ZG91dCA9IGRhdGFcblxuICAkc2NvcGUuZG93bmxvYWREYXRhID0gKCkgLT5cbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL3Rhc2ttYW5hZ2Vycy9cIiArICgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkgKyBcIi9zdGRvdXRcIlxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgVGFza01hbmFnZXJzU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICB2YXIgcmVmcmVzaDtcbiAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm1hbmFnZXJzID0gZGF0YTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFRhc2tNYW5hZ2Vyc1NlcnZpY2UubG9hZE1hbmFnZXJzKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLm1hbmFnZXJzID0gZGF0YTtcbiAgICB9KTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgcmV0dXJuICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignU2luZ2xlVGFza01hbmFnZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICB2YXIgcmVmcmVzaDtcbiAgJHNjb3BlLm1ldHJpY3MgPSB7fTtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdO1xuICB9KTtcbiAgcmVmcmVzaCA9ICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUubWV0cmljcyA9IGRhdGFbMF07XG4gICAgfSk7XG4gIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gICRzY29wZS5sb2cgPSB7fTtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLmxvZyA9IGRhdGE7XG4gIH0pO1xuICAkc2NvcGUucmVsb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZExvZ3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5sb2cgPSBkYXRhO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gJHNjb3BlLmRvd25sb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL3Rhc2ttYW5hZ2Vycy9cIiArICRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkICsgXCIvbG9nXCI7XG4gIH07XG59KS5jb250cm9sbGVyKCdTaW5nbGVUYXNrTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gICRzY29wZS5zdGRvdXQgPSB7fTtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRTdGRvdXQoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiAkc2NvcGUuc3Rkb3V0ID0gZGF0YTtcbiAgfSk7XG4gICRzY29wZS5yZWxvYWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkU3Rkb3V0KCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuc3Rkb3V0ID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuICRzY29wZS5kb3dubG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi90YXNrbWFuYWdlcnMvXCIgKyAkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCArIFwiL3N0ZG91dFwiO1xuICB9O1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLnNlcnZpY2UgJ1Rhc2tNYW5hZ2Vyc1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgQGxvYWRNYW5hZ2VycyA9ICgpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnNcIilcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGFbJ3Rhc2ttYW5hZ2VycyddKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcblxuLnNlcnZpY2UgJ1NpbmdsZVRhc2tNYW5hZ2VyU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBAbG9hZE1ldHJpY3MgPSAodGFza21hbmFnZXJpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcInRhc2ttYW5hZ2Vycy9cIiArIHRhc2ttYW5hZ2VyaWQgKyBcIi9tZXRyaWNzXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAbG9hZExvZ3MgPSAodGFza21hbmFnZXJpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcInRhc2ttYW5hZ2Vycy9cIiArIHRhc2ttYW5hZ2VyaWQgKyBcIi9sb2dcIilcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGxvYWRTdGRvdXQgPSAodGFza21hbmFnZXJpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcInRhc2ttYW5hZ2Vycy9cIiArIHRhc2ttYW5hZ2VyaWQgKyBcIi9zdGRvdXRcIilcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdUYXNrTWFuYWdlcnNTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB0aGlzLmxvYWRNYW5hZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGFbJ3Rhc2ttYW5hZ2VycyddKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KS5zZXJ2aWNlKCdTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgZmxpbmtDb25maWcsICRxKSB7XG4gIHRoaXMubG9hZE1ldHJpY3MgPSBmdW5jdGlvbih0YXNrbWFuYWdlcmlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvbWV0cmljc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMubG9hZExvZ3MgPSBmdW5jdGlvbih0YXNrbWFuYWdlcmlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvbG9nXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmxvYWRTdGRvdXQgPSBmdW5jdGlvbih0YXNrbWFuYWdlcmlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvc3Rkb3V0XCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

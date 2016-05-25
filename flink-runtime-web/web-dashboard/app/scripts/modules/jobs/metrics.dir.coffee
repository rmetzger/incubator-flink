#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

angular.module('flinkApp')

# ----------------------------------------------

.directive 'metricsGraph', ->
  template: '<div class="panel panel-default panel-metric">
               <div class="panel-heading">{{mtype}}
                 <a title="Remove" class="btn btn-default btn-xs pull-right" ng-click="removeMetric()"><i class="fa fa-close" /></a>
               </div>
               <div class="panel-body">
                 <nvd3 options="options" data="data"></nvd3>
               </div>
             </div>'
  replace: true
  scope:
    mtype: "@"
    removeMetric: "&"

  link: (scope, element, attrs) ->
    scope.value = null
    scope.data = [{
      values: []
    }]

    scope.options = {
      chart:
        type: 'lineChart'
        showLegend: false
        height: 200
        x: (d, i) ->
          d.x
        y: (d, i) ->
          d.y

        xTickFormat: (d) ->
#          console.log d
          d3.time.format('%H:%M:%S')(new Date(d))

        duration: 250
    }

    scope.remove = ->
      scope.$destroy()

    scope.$on 'metrics:data:update', (event, data) ->
      scope.value = parseInt(data[scope.mtype])

      scope.data[0].values.push {
        x: Date.now()
        y: scope.value
      }

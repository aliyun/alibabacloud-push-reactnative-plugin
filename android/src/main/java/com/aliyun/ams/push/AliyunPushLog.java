package com.aliyun.ams.push;

import android.util.Log;

/**
 * @author wangyun
 * @date 2023/1/18
 */
public class AliyunPushLog {
   private static boolean sLogEnabled = false;

   public static boolean isLogEnabled() {
      return sLogEnabled;
   }

   public static void setLogEnabled(boolean logEnabled) {
      sLogEnabled = logEnabled;
   }

   public static void d(String tag, String msg) {
      if (sLogEnabled) {
         Log.d(tag, msg);
      }
   }

   public static void e(String tag, String msg) {
      if (sLogEnabled) {
         Log.e(tag, msg);
      }
   }
}
